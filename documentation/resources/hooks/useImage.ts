import { useMemo, useEffect, useState, useRef } from 'react';

function useImage(imgSrc, width = 100) {
  const [info, setInfo] = useState({
    w: 0,
    h: 0,
    data: [],
  });

  // console.log(imgSrc);
  useEffect(() => {
    const imgEl = document.createElement('img');

    imgEl.onload = () => {
      console.log('loaded');
      console.log(imgEl.width, imgEl.height);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = (imgEl.height * width) / imgEl.width;

      console.log(canvas.width, canvas.height);
      // document.body.appendChild(canvas);
      ctx.drawImage(imgEl, 0, 0, imgEl.width, imgEl.height, 0, 0, canvas.width, canvas.height);
      const h = canvas.height;
      const w = canvas.width;

      // let y;
      console.log(w, h);
      // console.log(rows)
      let data = [];

      for (let y = 0; y < h; ++y) {
        const row = [];
        for (let x = 0; x < w; ++x) {
          // console.log(x,y);
          const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
          row.push({ r, g, b, a, rgb: `rgb(${r},${g},${b})` });
        }
        data.push(row);
        //   for (let x = 0; x <w; x = x + 1) {

        //     // const imageData = ctx.getImageData(x,y, 1, 1)
        //     console.log(x, y);

        //   }
      }
      // console.log(data);

      setInfo({
        w,
        h,
        data,
      });

      // ctx.getImageData(sx, sy, sw, sh);
    };
    imgEl.src = imgSrc;
  }, [imgSrc, width]);

  return info;
}

export default useImage;
