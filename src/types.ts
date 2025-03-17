// Event Types
export interface Event {
  _id: string;
  title: string;
  description: string;
  caption?: string;
  key: string;
  year: number;
  files: string[];
  thumbnail?: string;
  position?: [number, number, number];
  categoryKey?: string;
  visible?: boolean;
}

export interface PaginatedResponse {
  docs: Event[];
  totalPages: number;
  page: number;
  limit: number;
  totalDocs: number;
}

// Button Configuration
export interface ButtonConfig {
  label: string;
  key: string;
  color: string;
}

// Constants
export const buttonsConfig: ButtonConfig[] = [
  {
    label: "All",
    key: "all",
    color: "#2c2da3",
  },
  {
    label: "Our Journey",
    key: "our_journey",
    color: "#6c0ce7",
  },
  {
    label: "Highlights",
    key: "highlights",
    color: "#f49c53",
  },
  {
    label: "Sustainability",
    key: "sustainability",
    color: "#32d5b4",
  },
  {
    label: "Dark Days",
    key: "dark_days",
    color: "#Fe1030",
  },
];

export const categoryTypes = {
  all: "all",
  our_journey: "our_journey",
  highlights: "highlights",
  sustainability: "sustainability",
  dark_days: "dark_days",
};

export const categoryKeys = {
  our_journey: 1,
  highlights: 2,
  sustainability: 3,
  dark_days: 4,
};

// Helper Functions
export const splitStringPreserveWords = (input: string): string[] => {
  const middle = Math.floor(input.length / 2);
  let before = input.lastIndexOf(" ", middle);
  let after = input.indexOf(" ", middle + 1);

  if (middle - before < after - middle) {
    after = before;
  }

  const firstHalf = input.substring(0, after);
  const secondHalf = input.substring(after + 1);

  let temp: string[] = [];
  const array = [firstHalf, secondHalf];

  for (let index = 0; index < array.length; index++) {
    const elem = array[index];
    if (elem !== "") {
      temp.push(elem);
    }
  }

  return temp;
};

export const getFileType = (url: string): string => {
  // List of image extensions
  const imageExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
    "bmp",
    "tiff",
    "jfif",
    "ico",
  ];

  // List of video extensions
  const videoExtensions = [
    "mp4",
    "mkv",
    "flv",
    "gif",
    "avi",
    "mov",
    "wmv",
    "rm",
    "rmvb",
    "webm",
    "vob",
    "ogg",
  ];

  const docExtensions = ["pdf"];

  // Use the URL constructor to parse the URL
  const urlObj = new URL(url);

  // Extract the pathname from the URL
  const pathname = urlObj.pathname;

  // Split the pathname by '/'
  const parts = pathname.split("/");

  // Get the last part, which should be the file name
  const filename = parts[parts.length - 1];

  // Split the filename by '.', and get the last part, which should be the extension
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  // Check the file type
  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (videoExtensions.includes(extension)) {
    return "video";
  } else if (docExtensions.includes(extension)) {
    return "document";
  } else {
    return "unknown";
  }
};

export const toTitleCase = (str: string): string => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
