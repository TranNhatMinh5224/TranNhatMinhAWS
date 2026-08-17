const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'MinhQuanAWS');
const destDir = __dirname;

// 1. Hàm dọn dẹp thư mục hiện tại (xóa Docusaurus)
function cleanDest() {
  const entries = fs.readdirSync(destDir);
  for (let entry of entries) {
    if (entry === 'copy_hugo.js' || entry === '.git') continue; // Giữ lại script và git
    const fullPath = path.join(destDir, entry);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

// 2. Hàm copy đệ quy và đổi tên
function copyAndReplace(src, dest) {
  if (!fs.existsSync(src)) return;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
      copyAndReplace(srcPath, destPath);
    } else if (entry.isFile()) {
      // Nếu là file text (md, toml, yaml, html, json...) thì đọc và thay thế chữ
      const ext = path.extname(entry.name).toLowerCase();
      const textExts = ['.md', '.toml', '.yaml', '.yml', '.html', '.json', '.js', '.css', '.txt'];
      
      if (textExts.includes(ext)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        // Đổi tên tiếng Việt
        content = content.replace(/Đoàn Minh Quân/g, 'Trần Nhật Minh');
        content = content.replace(/Minh Quân/g, 'Nhật Minh');
        
        // Đổi tên tiếng không dấu / URL
        content = content.replace(/MinhQuanAWS/g, 'TranNhatMinhAWS');
        content = content.replace(/quan1407/gi, 'trannhatminh'); // giả định đổi github name luôn
        content = content.replace(/doanminhquan969@gmail\.com/gi, '[Điền Email Của Bạn]');
        content = content.replace(/0913998757/g, '[Điền SĐT Của Bạn]');
        content = content.replace(/22DTHE4/g, '[Điền Lớp Của Bạn]');
        
        fs.writeFileSync(destPath, content);
      } else {
        // Nếu là hình ảnh, file zip... thì copy nguyên bản
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

console.log('Bắt đầu dọn dẹp Docusaurus...');
cleanDest();

console.log('Đang copy toàn bộ dự án Hugo từ MinhQuanAWS...');
copyAndReplace(srcDir, destDir);

console.log('Đã copy và đổi tên thành Trần Nhật Minh thành công 100%!');
