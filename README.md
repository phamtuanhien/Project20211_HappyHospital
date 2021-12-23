## Hướng dẫn chạy code:
- `git clone https://github.com/phamtuanhien/Project20211_HappyHospital.git`
- cd folder `Project20211_HappyHospital`
- `yarn install`
- `yarn dev`
- Chạy file `index.html` trong folder `dist` bằng Extension "Live Server"

Nếu như trình duyệt mở file `index.html` thay vì redirect đến `http://localhost/...` thì làm theo hướng dẫn sau: 
  - Mở file `launch.json` và bỏ đi trường `"file"` (trong `"configurations"`) 
  - Thay bằng trường `"url"` với giá trị là đường dẫn từ localhost đến file index.html
    Chẳng hạn: "url": "http://localhost/~leegie/Project20211_HappyHospital/dist/index.html"
