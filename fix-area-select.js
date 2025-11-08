const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/AreaSelect.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix Onpukan: Change "A〜C室（1部屋）" to "A〜C室（3部屋）"
content = content.replace(
  '<span className="font-bold">スタジオ数：</span>A〜C室（1部屋）',
  '<span className="font-bold">スタジオ数：</span>A〜C室（3部屋）'
);

// Fix Midori: Change "3部屋" to "1部屋"
content = content.replace(
  /(<span className="font-bold">スタジオ数：<\/span>)3部屋/,
  '$11部屋'
);

// Fix Midori pricing: Change "550円〜/30分" to "個人700円・バンド1800円/60分"
content = content.replace(
  '<span className="font-bold">料金：</span>550円〜/30分',
  '<span className="font-bold">料金：</span>個人700円・バンド1800円/60分'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('AreaSelect.jsx fixed successfully!');
