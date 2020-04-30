export default function keyByField(list, key) {
  const map = {};
  list.forEach((item) => {
    map[item[key]] = item;
  });
  return map;
}
