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

## Hướng dẫn chơi game:
- Trong game này người chơi sẽ được điều khiển một AGV trong bệnh viện, nhiệm vụ của người chơi phải di chuyển AGV nhanh nhất đến đích, trước deadline và tránh va chạm với Agents trong bệnh viện
- Người chơi sẽ được thi đua với các AGV do máy (AI) điều khiển. Việc phải về đích với thứ hạng cao là một trong các nhiệm vụ nữa của người chơi
- Để điều khiển AGV, người chơi cần dùng các phím `W A S D` trên bàn phím để di chuyển lên/trái/xuống/phải AGV
- Để di chuyển AGV rẽ sang hướng khác cần `nhấn giữ đồng thời 2 nút` trên bàn phím

  **Ví dụ:** Như hình dưới đây, để rẽ sang phải chúng ta cần nhấn giữ đồng thời 2 nút `S D`
  <p align="center">
    <img src="https://i.imgur.com/b9Dh1t8.png" alt="Hướng dẫn di chuyển AGV rẽ sang bên phải"/>
  </p>

### Link chơi game: https://happyhospital.herokuapp.com/
