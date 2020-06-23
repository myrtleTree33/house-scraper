import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
  const page = 1;

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

    price = price.replace(/\$/, '').trim();

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

    const numRooms =
      $(
        'div > div.listingContainerTop > div.row.listingDetailsInfo > div.listingDetail.listingDetailsView.col-xs-6.col-6.col-sm-7.col-md-7 > div > div.listingDetailType > span:nth-child(1)',
        elm,
      ).text() || '';

    const output = { title, price, yearBuilt, numRooms };

    console.log('---------');
    console.log(output);
    console.log('---------');
  });

  // console.log(data);
})();
