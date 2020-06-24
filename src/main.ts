import { extractSrx } from './srx';

(async () => {
  const houses = await extractSrx(2);

  console.log(houses);
})();
