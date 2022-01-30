const axios = require('axios');
const cheerio = require('cheerio');
const websites = [
  {
    name: 'espn',
    address: 'https://www.espn.com/nba/',
    base: 'https://www.espn.com',
    linkSelector: '.headlineStack__header + section > ul > li > a',
    textSelector: '.headlineStack__header + section > ul > li > a',
  },
  {
    name: 'bleacherreport',
    address: 'https://bleacherreport.com/nba',
    base: '',
    linkSelector: '.articleTitle',
    textSelector: '.articleTitle',
  },
  {
    name: 'slam',
    address: 'https://www.slamonline.com/',
    base: '',
    linkSelector: '.h-bloglist-block-content-top > h3 > a',
    textSelector: '.h-bloglist-block-content-top > h3 > a',
  },
  {
    name: 'yahoo',
    address: 'https://sports.yahoo.com/nba/',
    base: 'https://sports.yahoo.com',
    linkSelector: '.js-content-viewer',
    textSelector: 'h2, h3, .YahooSans-Medium,  span > span',
  },
  {
    name: 'the ringer',
    address: 'https://www.theringer.com/nba',
    base: '',
    linkSelector: '.l-hero h2.c-entry-box--compact__title > a',
    textSelector: '.l-hero h2.c-entry-box--compact__title > a',
  },
  {
    name: 'nba',
    address: 'https://www.nba.com/news/category/top-stories',
    base: 'https://www.nba.com',
    linkSelector: '.flex-1 > a',
    textSelector: 'h2',
  },
  {
    name: 'cbs',
    address: 'https://www.cbssports.com/nba/',
    base: 'https://www.cbssports.com',
    linkSelector: '.top-marquee-wrap a',
    textSelector: 'h1, h2, h3',
  },
];

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
    let title;
    const res = await axios.get(website.address);
    const html = res.data;
    const $ = cheerio.load(html);

    $(website.linkSelector, html).each(function () {

      let url = website.base + $(this).attr('href');

      /* 
      for some sites the article title is deeper within the 'a' tag and so
      we have to spelunk into the tag to find the selector with the title text
      */

      if( website.linkSelector == website.textSelector ) {
        title = $(this).text().trim();
      } else {
        title = $(this).find(website.textSelector).text().trim();
      }

      originalArticles.push({ title, url, source: website.name });

    });

    return originalArticles.filter((article) => article.title !== '');
  } catch (err) {
    return err.messaage;
  }
};

const getArticles = async () => {
  const articles = [];
  for (const website of websites) {
    const data = await getData(website);
    articles.push(...data);
  }
  return articles;
};

module.exports = {
  websites,
  shuffleArray,
  limitBlogs,
  getData,
  getArticles,
};
