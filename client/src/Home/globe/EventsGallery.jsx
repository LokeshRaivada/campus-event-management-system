import React from 'react';
import DomeGallery from './DomeGallery.jsx';
import events from './events.json';

export default function EventsGallery() {
  const images = events.map(e => ({
    src: e.src,
    alt: e.alt,
    title: e.title,
    info: e.info
  }));

  return <DomeGallery images={images} />;
}
