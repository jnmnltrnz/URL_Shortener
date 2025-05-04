import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();
import { db } from "./db/knex";

//middleware
app.use(cors());
app.use(express.json());

/*
##################################################
||                                              ||
||              Example endpoints               ||
||                                              ||
##################################################
*/

// Root endpoint - Returns a simple hello world message and default client port
app.get("/", async (_req, res) => {
  res.json({ hello: "world", "client-default-port": 3000 });
});

// GET /url-shortener - Fetches all records from the url_shortener table
app.get("/url-shortener", async (_req, res) => {
  try {
  const data = await db("url_shortener")
  .select("*")
  .orderBy("id", "asc");  
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Error fetching URL shorteners" });
  }
});

app.post("/url-shortener", async (req, res) => {
  const { actual_url, published_url, custom_slug, expiration_date } = req.body;

  // Validate required fields
  if (!actual_url || !published_url) {
    res.status(400).json({ 
      error: "Both actual_url and published_url are required" 
    });
  }

  try {
    // Check if custom_slug exists (if provided)
    if (custom_slug) {
      const existing = await db("url_shortener")
        .where({ custom_slug })
        .first();

      if (existing) {
        res.status(409).json({ 
          error: "Custom slug already exists",
          existing_entry: existing
        });
      }
    }

    // Insert new record
    const [doc] = await db("url_shortener")
      .insert({
        actual_url,
        published_url,
        custom_slug: custom_slug || null,
        expiration_date: expiration_date || null,
        created_at: new Date()
      })
      .returning("*");

    res.status(201).json({
      success: true,
      data: doc,
      short_url: custom_slug 
        ? `${req.protocol}://${req.get('host')}/${custom_slug}`
        : null
    });

  } catch (error) {
    console.error("URL creation error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});


// DELETE /url-shortener/:id - Deletes a URL shortener record by ID
app.delete("/url-shortener/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check if record exists first
    const existingRecord = await db("url_shortener").where({ id }).first();

    if (!existingRecord) {
       res.status(404).json({ error: "URL shortener record not found" });
    }

    // Delete the record
    await db("url_shortener").where({ id }).del();

    res.status(200).json({ message: `URL shortener with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("DELETE /url-shortener/:id error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this endpoint to your existing server code
app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const fullPublishedUrl = `${req.protocol}://${req.get("host")}/${slug}`;

  try {
    // Find the URL record using published_url
    const urlRecord = await db("url_shortener")
      .where({ published_url: fullPublishedUrl })
      .first();

    if (!urlRecord) {
      res.status(404).json({ error: "Short URL not found" });
    }

    // Check if the URL is expired
    if (
      urlRecord.expiration_date &&
      new Date(urlRecord.expiration_date) < new Date()
    ) {
      res.status(410).json({ error: "This short URL has expired" });
    }

    // Redirect to the actual URL
    res.redirect(301, urlRecord.actual_url);
  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: "Server error during redirect" });
  }
});



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
