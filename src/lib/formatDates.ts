import dayjs from "dayjs";


export function formatSimpleDate(isoString:string) {
  return dayjs(isoString).format("DD MMM YYYY");
}

// Example usage:
// console.log(formatSimpleDate("2025-09-12T07:22:54.712Z"));
// 👉 "12 Sep 2025"
