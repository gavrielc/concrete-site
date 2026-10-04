import {createElement} from 'react';

// List thumbnails crop images to a square, which cuts wide logos. Show the whole logo instead.
export const logoThumb = (url) =>
    url
        ? createElement('img', {
              src: `${url}?w=120&fit=max`,
              alt: '',
              style: {width: '100%', height: '100%', objectFit: 'contain'},
          })
        : undefined;
