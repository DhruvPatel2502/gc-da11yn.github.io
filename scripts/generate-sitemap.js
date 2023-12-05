const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const eleventy = require('@11ty/eleventy');
const path = require('path');

const generateSitemap = async () => {
  try {
    // Create a new Eleventy instance
    const eleventyInstance = new eleventy();

    // Build the Eleventy site to generate data files
    await eleventyInstance.init();
    await eleventyInstance.write();

    // Read the generated data files
    const dataDir = path.resolve(__dirname, '../_site/_data');
    const dataFiles = fs.readdirSync(dataDir);

    // Extract URLs from the data files
    const urls = dataFiles.flatMap((file) => {
      const dataFilePath = path.resolve(dataDir, file);
      const data = require(dataFilePath);
      return data.pages.map((page) => ({ url: page.url, changefreq: 'weekly', priority: 0.8 }));
    });

    const stream = new SitemapStream();

    urls.forEach((url) => {
      stream.write(url);
    });

    stream.end();

    const sitemap = await streamToPromise(stream);
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('Sitemap generated successfully.');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

generateSitemap();
