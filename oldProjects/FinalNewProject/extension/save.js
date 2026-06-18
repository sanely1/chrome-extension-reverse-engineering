(() => {
  // src/save/utils/get-image-dimensions.ts
  var getImageDimensions = (image, maxSidePx) => {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    if (width > height && width > maxSidePx) {
      width = maxSidePx;
      height = width / aspectRatio;
    } else if (height > maxSidePx) {
      height = maxSidePx;
      width = height * aspectRatio;
    }
    return { width: Math.round(width), height: Math.round(height) };
  };

  // src/save/index.ts
  window.addEventListener("message", (request) => {
    if (request.data.url) {
      const image = document.createElement("img");
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        const canvas = document.createElement("canvas");
        const maxSidePx = 500;
        const { width, height } = getImageDimensions(image, maxSidePx);
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          const dataURL = canvas.toDataURL("image/jpeg");
          window.parent.postMessage(
            {
              imgUrl: request.data.url,
              imgData: dataURL
            },
            "*"
          );
        } catch {
          window.parent.postMessage(
            {
              imgUrl: request.data.url,
              imgData: null
            },
            "*"
          );
        }
      };
      image.onerror = () => {
        window.parent.postMessage(
          {
            imgUrl: request.data.url,
            imgData: null
          },
          "*"
        );
      };
      image.src = request.data.url;
    }
  });
})();
