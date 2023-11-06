import React from "react";

export default function Footer() {
  const iframeEmbedCode = `
    <iframe src="https://giphy.com/embed/4NWT0Ry3dtTLW" width="100%" height="100%" 
    style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
  `;

  return (
    <footer className="mb-10 px-40 flex justify-end items-center text-gray-500">
      <p className="text-xs mr-4">
        <span className="font-semibold">Chasing Excellence</span>
      </p>
      <div
        style={{ width: '50px', height: '50px', position: 'relative' }} // Set a fixed width and height for the GIF container
        dangerouslySetInnerHTML={{ __html: iframeEmbedCode }}
      />
    </footer>
  );
}
