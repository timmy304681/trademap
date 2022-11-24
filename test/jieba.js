const nodejieba = require('nodejieba');

const inputArr = [
  'Nike Air Max 98 University Red 氣墊 休閒鞋 運動鞋 復古 supreme紅NT$1,490',
  '2013 急售 Benz E200 Estate Avantgarde (S212型) 促銷優惠 清倉 已認證美車 實車實價 喜歡來談 絕對便宜',
  '細肩綁帶罩衫*2',
  '德國WHITE PIA厚絨防風休閒褲 L號',
  '布藝髮夾黃色蝴蝶結組',
  '棋盤格冰絲闊腿褲',
  '【Prada 普拉達】三角標綁帶短靴馬丁靴。✔️頂級品質。✨✨鞋面採用進口尼龍拼開邊珠牛皮，內里為進口絲綢羊皮，墊腳為進口牛皮，原版開模橡膠大底。',
  '雨傘架 雨傘收納桶 家用客廳落地式放傘架',
  'HANBOLI凡士林 玫瑰 洋甘菊 蜂蜜 護唇膏 護手霜 護唇 護髮 滋潤膏 滋潤霜 隨身瓶裝 補水 唇膜',
  'Paul&Joe 限量指甲油 #021 過期品',
];

for (input of inputArr) {
  const result = nodejieba.textRankExtract(input, 5);
  const tags = nodejieba.tag(input);
  console.log('tags: ', tags);

  console.log('input: ', input);
  console.log(result);
}
