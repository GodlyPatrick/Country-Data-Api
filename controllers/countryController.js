// controllers/countryController.js
import axios from "axios";
import fs from "fs";
import path from "path";
import { createCanvas } from "canvas";
import { fn, col } from "sequelize";
import db from "../models/index.js";

const { Country, Status, sequelize } = db;

// External APIs (use .env to override if needed)
const COUNTRY_API_URL =
  process.env.COUNTRY_API_URL ||
  "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies";
const EXCHANGE_RATE_API_URL =
  process.env.EXCHANGE_RATE_API_URL || "https://open.er-api.com/v6/latest/USD";

// Helper: random multiplier 1000..2000
const randomMultiplier = () => Math.floor(Math.random() * 1001) + 1000;

// Helper: calculate GDP per spec: population × random(1000–2000) ÷ exchange_rate
const calcEstimatedGdp = (population, exchangeRate) => {
  if (!exchangeRate || exchangeRate <= 0) return null;
  const multiplier = randomMultiplier();
  return (population * multiplier) / exchangeRate;
};

// Fetch helpers
const fetchCountries = async () => {
  try {
    const resp = await axios.get(COUNTRY_API_URL, { timeout: 15000 });
    return resp.data;
  } catch (err) {
    throw new Error("Could not fetch data from countries API");
  }
};

const fetchExchangeRates = async () => {
  try {
    const resp = await axios.get(EXCHANGE_RATE_API_URL, { timeout: 15000 });
    if (!resp.data || !resp.data.rates) throw new Error("Invalid rates data");
    return resp.data.rates;
  } catch (err) {
    throw new Error("Could not fetch data from exchange rates API");
  }
};

// Generate summary image and save to cache/summary.png (per spec)
const generateSummaryImage = async (countries, totalCount, lastRefreshedAt) => {
  const cacheDir = "cache";
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // background
  ctx.fillStyle = "#f9f9f9";
  ctx.fillRect(0, 0, width, height);

  // title
  ctx.fillStyle = "#333";
  ctx.font = "bold 36px Arial";
  ctx.fillText("Country Summary Report", 40, 60);

  ctx.font = "20px Arial";
  ctx.fillText(`Total Countries: ${totalCount}`, 40, 120);
  ctx.fillText(`Last Refreshed: ${new Date(lastRefreshedAt).toISOString()}`, 40, 150);

  // top 5 by estimated_gdp (treat null as 0 for sorting, display 'N/A' if null/0)
  const sortable = countries
    .map(c => ({ ...c, sort_gdp: c.estimated_gdp ?? 0 }))
    .sort((a, b) => b.sort_gdp - a.sort_gdp)
    .slice(0, 5);

  ctx.font = "22px Arial";
  ctx.fillText("Top 5 Countries by Estimated GDP:", 40, 220);

  let y = 260;
  sortable.forEach((c, i) => {
    const gdpDisplay = c.estimated_gdp ? parseFloat(c.estimated_gdp).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A';
    ctx.fillText(`${i + 1}. ${c.name} — ${gdpDisplay}`, 60, y);
    y += 40;
  });

  const filePath = path.join("cache", "summary.png");
  fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
  console.log("✅ Summary image generated!");
};

// POST /countries/refresh
export const refreshCountries = async (req, res) => {
  let countriesData, rates;
  try {
    [countriesData, rates] = await Promise.all([fetchCountries(), fetchExchangeRates()]);
  } catch (err) {
    console.error("External API fetch failed:", err.message);
    return res.status(503).json({
      error: "External data source unavailable",
      details: err.message,
    });
  }

  if (!Array.isArray(countriesData)) {
    return res.status(503).json({
      error: "External data source unavailable",
      details: "Invalid countries data",
    });
  }

  const lastRefreshedAt = new Date().toISOString();
  const rows = [];

  for (const c of countriesData) {
    if (!c.name || c.population == null) {
      continue; // Skip invalid, no 400 per spec for refresh
    }

    const currencyCode = c.currencies?.[0]?.code ?? null;
    const exchangeRate = currencyCode && rates[currencyCode] ? rates[currencyCode] : null;

    let estimated_gdp;
    if (currencyCode === null) {
      estimated_gdp = 0;
    } else if (exchangeRate == null) {
      estimated_gdp = null;
    } else {
      const gdpValue = calcEstimatedGdp(c.population, exchangeRate);
      estimated_gdp = gdpValue != null ? parseFloat(gdpValue.toFixed(2)) : null;
    }

    rows.push({
      name: c.name,
      capital: c.capital ?? null,
      region: c.region ?? null,
      population: c.population,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      estimated_gdp,
      flag_url: c.flag ?? null,
      last_refreshed_at: lastRefreshedAt,
    });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();

    // Bulk upsert - assumes unique index on name (case-insensitive collation in DB)
    await Country.bulkCreate(rows, {
      updateOnDuplicate: [
        "capital",
        "region",
        "population",
        "currency_code",
        "exchange_rate",
        "estimated_gdp",
        "flag_url",
        "last_refreshed_at",
      ],
      transaction,
    });

    await Status.upsert(
      {
        id: 1,
        total_countries: rows.length,
        last_refreshed_at: lastRefreshedAt,
      },
      { transaction }
    );

    await transaction.commit();
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("DB upsert failed:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }

  try {
    await generateSummaryImage(rows, rows.length, lastRefreshedAt);
  } catch (imgErr) {
    console.error("Image generation failed:", imgErr.message);
  }

  return res.status(201).json({
    message: "Countries refreshed successfully",
    total_countries: rows.length,
    last_refreshed_at: lastRefreshedAt,
  });
};

// GET /countries
export const getAllCountries = async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    const where = {};
    const order = [];

    if (region) where.region = region;
    if (currency) where.currency_code = currency;
    if (sort === "gdp_desc") order.push(["estimated_gdp", "DESC"]);

    const countries = await Country.findAll({ where, order });
    return res.status(200).json(countries);
  } catch (err) {
    console.error("Error fetching countries:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /countries/:name (case-insensitive)
export const getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const country = await Country.findOne({
      where: sequelize.where(fn('LOWER', col('name')), name.toLowerCase()),
    });

    if (!country) return res.status(404).json({ error: "Country not found" });
    return res.status(200).json(country);
  } catch (err) {
    console.error("Error fetching country:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /countries/:name (case-insensitive)
export const deleteCountry = async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await Country.destroy({
      where: sequelize.where(fn('LOWER', col('name')), name.toLowerCase()),
    });

    if (!deleted) return res.status(404).json({ error: "Country not found" });
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting country:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /status
export const getStatus = async (req, res) => {
  try {
    const status = await Status.findByPk(1);
    if (!status) return res.status(404).json({ error: "Status not found" });
    return res.status(200).json({
      total_countries: status.total_countries,
      last_refreshed_at: status.last_refreshed_at.toISOString(),
    });
  } catch (err) {
    console.error("Error fetching status:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /countries/image
export const getSummaryImage = async (req, res) => {
  try {
    const filePath = path.join("cache", "summary.png");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Summary image not found" });
    }
    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error("Error serving image:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};