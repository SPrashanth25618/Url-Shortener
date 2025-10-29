import Url from "../models/url.js";
import { getId } from "../Utils/nanoid.js";

// helper ensure protocol
const ensureProtocol = (u) => {
  const s = String(u || "").trim();
  if (!/^https?:\/\//i.test(s)) return "http://" + s;
  return s;
};

const buildShortUrl = (code) => {
  const base = (process.env.APP_URL || "").replace(/\/+$/, "");
  const short = String(code || "").replace(/^\/+/, "");
  return `${base}/${short}`;
};

const saveShortUrl = async (shortCode, originalUrl, userId = null) => {
  try {
    const newUrl = new Url({
      shortCode,
      originalUrl,
      createdBy: userId || undefined,
    });

    await newUrl.save();
    return newUrl;
  } catch (err) {
    if (err.code === 11000) throw new Error("Short code collision, try again");
    throw new Error(err.message || String(err));
  }
};

// ensure getExistingUrl and getCustomShortUrl use createdBy in queries:
const getExistingUrl = async (originalUrl, userId = null) => {
  const query = userId ? { originalUrl, createdBy: userId } : { originalUrl };
  return await Url.findOne(query).exec();
};

const getCustomShortUrl = async (slug) => {
  if (!slug) return null;
  return await Url.findOne({ shortCode: slug }).exec();
};

// increments clicks atomically and returns updated doc
const getShortUrl = async (shortCode) => {
  return await Url.findOneAndUpdate(
    { shortCode },
    { $inc: { clicks: 1 } },
    { new: true }
  ).exec();
};

// when creating, make sure you normalize original URL (add protocol if missing)
const createShortUrlWithoutUser = async (originalUrl, userId = null) => {
  if (!originalUrl || typeof originalUrl !== "string")
    throw new Error("original URL is required");
  const normalized = ensureProtocol(originalUrl.trim());

  const existing = await getExistingUrl(normalized, userId);
  if (existing) return existing.shortCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = getId(7);
    const exists = await getCustomShortUrl(shortCode);
    if (!exists) {
      const doc = await saveShortUrl(shortCode, normalized, userId);
      return doc.shortCode;
    }
  }
  throw new Error("Could not generate unique short code, try again");
};

/**
 * Create short url for authenticated users (optional custom slug)
 * If originalUrl already exists for this user, return its shortCode.
 */
const createShortUrlWithUser = async (originalUrl, userId, slug = null) => {
  const normalized = ensureProtocol(String(originalUrl).trim());

  // If URL already exists for this user, return existing shortCode
  const existingForUser = await getExistingUrl(normalized, userId);
  if (existingForUser) return existingForUser.shortCode;

  // if custom slug provided, check collision first
  if (slug) {
    const exists = await getCustomShortUrl(slug);
    if (exists) throw new Error("This custom url already exists");
    await saveShortUrl(slug, normalized, userId);
    return slug;
  }

  // otherwise generate unique code (delegates to without-user but passes userId)
  return await createShortUrlWithoutUser(normalized, userId);
};

// Controller create endpoint
export const createShortUrl = async (req, res) => {
  try {
    const data = req.body;
    const originalUrl = (data.url || data.originalUrl || "").trim();
    if (!originalUrl)
      return res.status(400).json({ error: "url is required in body" });

    let shortCode;
    if (req.user) {
      shortCode = await createShortUrlWithUser(
        originalUrl,
        req.user._id,
        data.slug
      );
    } else {
      shortCode = await createShortUrlWithoutUser(originalUrl);
    }

    return res
      .status(201)
      .json({ shortCode, shortUrl: buildShortUrl(shortCode) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getMyUrls = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const urls = await Url.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return res.status(200).json({ count: urls.length, urls });
  } catch (err) {
    console.error("getMyUrls:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Controller: redirect from short code
 * route: GET /:id   (id is the shortCode)
 */
export const redirectFromShortUrl = async (req, res) => {
  try {
    const { id } = req.params; // id is the shortCode
    const urlDoc = await getShortUrl(id);
    if (!urlDoc) return res.status(404).send("Short URL not found");
    return res.redirect(urlDoc.originalUrl);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

/**
 * Create custom short URL (explicit endpoint)
 * body: { url: "...", slug: "customSlug" }
 */
export const createCustomShortUrl = async (req, res) => {
  try {
    const { url, slug } = req.body;
    if (!url || !slug) return res.status(400).json({ error: "url and slug are required" });

    const cleanedSlug = String(slug).trim();
    const exists = await getCustomShortUrl(cleanedSlug);
    if (exists) return res.status(409).json({ error: "slug already taken" });

    const normalized = ensureProtocol(String(url).trim());
    const existing = await getExistingUrl(normalized, req.user ? req.user._id : null);
    if (existing) {
      return res.status(200).json({ shortUrl: buildShortUrl(existing.shortCode) });
    }

    await saveShortUrl(cleanedSlug, normalized, req.user ? req.user._id : null);
    return res.status(201).json({ shortUrl: buildShortUrl(cleanedSlug) });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
