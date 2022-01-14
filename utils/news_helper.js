const axios = require('axios');
const cheerio = require('cheerio');
const websites = [
  {
    name: 'espn',
    address: 'https://www.espn.com/nba/',
    base: 'https://www.espn.com',
    selector: '.headlineStack__header + section > ul > li > a',
  },
  {
    name: 'bleacherreport',
    address: 'https://bleacherreport.com/nba',
    base: '',
    selector: '.articleTitle',
  },
  {
    name: 'slam',
    address: 'https://www.slamonline.com/',
    base: '',
    selector: '.h-bloglist-block-content-top > h3 > a',
  },
  {
    name: 'yahoo',
    address: 'https://sports.yahoo.com/nba/?guccounter=1',
    base: 'https://sports.yahoo.com',
    selector: '.js-content-viewer',
  },
  {
    name: 'the ringer',
    address: 'https://www.theringer.com/nba',
    base: '',
    selector: '.l-hero h2.c-entry-box--compact__title > a',
  },
];

// Don't use Canadian NBA website:
// const nbaWebsite = {
//   name: 'nba',
//   address: 'https://ca.nba.com/news',
//   base: '',
//   selectorUrl: 'article a',
//   selectorTitle: '.card__headline',
// };

const nbaWebsite = {
  name: 'nba',
  address: 'https://nba.com/news',
  base: 'https://nba.com',
  selectorUrl: 'article a',
  selectorTitle: 'header span',
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const limitBlogs = (request, articles) => {
  const retArticles = [...articles];
  if (request.query && request.query.limit) {
    if (request.query.limit < 0) {
      request.query.limit = 0;
    }
    return retArticles.slice(0, request.query.limit);
  }
  return retArticles;
};

const getData = async (website) => {
  try {
    const originalArticles = [];
    const res = await axios.get(website.address);
    const html = res.data;
    const $ = cheerio.load(html);

    $(website.selector, html).each(function () {
      const resUrl = $(this).attr('href');
      const url = website.base + resUrl;
      let title = $(this).text();

      originalArticles.push({ title, url, source: website.name });
    });
    return originalArticles.filter((article) => article.title !== '');
  } catch (err) {
    return err.messaage;
  }
};

const getNbaData = async (website) => {
  const res = await axios.get(website.address);
  const html = res.data;
  const $ = cheerio.load(html);
  const nbaTitle = [];
  const nbaUrl = [];
  const nbaArticles = [];
  
  $(website.selectorTitle, html).each(function () {
    nbaTitle.push($(this).text().trim());
  });

  $(website.selectorUrl, html).each(function () {
    nbaUrl.push(website.base + $(this).attr('href'));
  });
  for (let i = 0; i < nbaTitle.length; i++) {
    const article = { title: nbaTitle[i], url: nbaUrl[i], source: 'nba' };
    nbaArticles.push(article);
  }
  return nbaArticles;
};

const getArticles = async () => {
  const articles = [];
  for (const website of websites) {
    const data = await getData(website);
    articles.push(...data);
  }
  const nbaData = await getNbaData(nbaWebsite);
  articles.push(...nbaData);
  return articles;
};
module.exports = {
  nbaWebsite,
  websites,
  shuffleArray,
  limitBlogs,
  getData,
  getArticles,
  getNbaData,
};
