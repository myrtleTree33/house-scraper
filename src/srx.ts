import axios from 'axios';
import cheerio from 'cheerio';

export const extractSrx = async (maxPage = 299) => {
  const houses = new Map();

  for (let i = 0; i < maxPage; i++) {
    console.log(`numHouses=${houses.size}`);
    console.log(`scraping page ${i}..`);
    await scrapePage(houses, i);
  }

  return Promise.resolve(houses);
};

export const scrapePage = async (houses, page: number) => {
  const { data } = await axios.get(
    `https://www.srx.com.sg/search/sale/hdb?page=${page}`,
  );

  const $ = cheerio.load(data);

  $(
    'body > div:nth-child(8) > div > div.col-xl-10.offset-xl-1 > div.row.align-items-start.grid > div',
  ).each(function (i, elm) {
    let price =
      $(
        'div > div.listingContainerTop > div.row.listingDetailsInfo > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.row.listingEnquiryRow > div.col-md-7.no-padding.visible-lg > div',
        elm,
      ).text() || '';

    price = price.replace(/\$|,/g, '').trim();
    price = parseInt(price);

    let title =
      $(
        'div > div.listingContainerTop > div.row.listingDetailsInfo > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.title-row.insideListingTitleRow.visible-lg > a > span',
        elm,
      ).text() || '';

    title = title.trim();

    let yearBuilt =
      $(
        'div > div.listingContainerTop > div.row.listingDetailsInfo > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.listingDetailType > span:nth-child(3)',
      ).text() || '';

    yearBuilt = yearBuilt.replace(/Built-|•/g, '');

    const numRoomsRaw =
      $(
        'div > div.listingContainerTop > div.row.listingDetailsInfo > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.listingDetailType > span:nth-child(1)',
        elm,
      ).text() || '';

    let meta = undefined;

    let numRooms = numRoomsRaw.replace('Room', '').trim();
    numRooms = parseInt(numRooms);

    if (isNaN(numRooms)) {
      meta = numRoomsRaw;
      numRooms = undefined;
    }

    let numBedrooms =
      $(
        'div > div.listingContainerTop.highlight > div.row.listingDetailsInfo.highlight > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.row.listingEnquiryRow > div.col-md-5.listingDetailRoom > div > div.listingDetailRoomNo',
        elm,
      ).text() || '';

    numBedrooms = parseInt(numBedrooms) || undefined;

    let numBaths =
      $(
        'div > div.listingContainerTop.highlight > div.row.listingDetailsInfo.highlight > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.row.listingEnquiryRow > div.col-md-5.listingDetailRoom > div > div.listingDetailToiletNo',
        elm,
      ).text() || '';

    numBaths = parseInt(numBaths) || undefined;

    const description = (
      $(
        'div > div.row.listingDetailAgent.highlight > div.col-xs-7.col-7.col-sm-8.col-md-6.col-lg-7.nopadding.listing-detail-agent-right > div',
        elm,
      ).text() || ''
    ).trim();

    const isHighFloor = /high floor/.test(description.toLowerCase());

    const agent = (
      $(
        'div > div.row.listingDetailAgent.highlight > div.col-xs-5.col-5.col-sm-4.col-md-6.col-lg-5.nopadding.listing-detail-agent-left > div.listingDetailAgentNameDiv > a',
        elm,
      ).text() || ''
    ).trim();

    let link = ($('div > a', elm).attr('href') || '').trim();
    if (link) {
      link = `https://www.srx.com.sg${link}`;
    }

    if (title && price) {
      const output = {
        title,
        price,
        yearBuilt,
        numRooms,
        numBedrooms,
        numBaths,
        meta,
        description,
        isHighFloor,
        agent,
        link,
      };

      houses.set(genKey(output), output);
    }
  });

  return Promise.resolve();
};

const genKey = (output) => {
  const {
    title,
    price,
    yearBuilt,
    numRooms,
    numBedrooms,
    numBaths,
    meta,
  } = output;

  return `${title}-price`;
};
