export const getCurrencySymbol = (country: string = "") => {
  switch (country.toLowerCase()) {
    case "india": return "₹";
    case "united states":
    case "usa":
    case "us": return "$";
    case "united kingdom":
    case "uk": return "£";
    case "europe":
    case "germany":
    case "france": return "€";
    case "uae":
    case "dubai": return "AED";
    case "saudi arabia": return "SAR";
    default: return "₹";
  }
};

