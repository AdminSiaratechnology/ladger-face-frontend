import dayjs from "dayjs";


export function formatSimpleDate(isoString:string) {
  return dayjs(isoString).format("DD MMM YYYY");
}