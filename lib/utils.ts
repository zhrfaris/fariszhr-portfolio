import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateLoremIpsum = (length: number) => {
  const text =
    "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Totam, necessitatibus! Eligendi vero perspiciatis quisquam, atque voluptatum tempora ipsam sint at totam quis porro suscipit repellendus maiores sapiente dolor dolore architecto corrupti, dolorem facere vel repellat voluptates. Quibusdam cum autem iure earum expedita, amet nulla nemo repellendus deleniti optio ea aperiam inventore minus error obcaecati iusto ratione sunt quasi mollitia quam incidunt voluptatum facere blanditiis doloribus. Nihil ratione architecto hic amet debitis a dignissimos quaerat ipsam dolorum culpa minus at, minima corrupti quibusdam id voluptatem ab natus laboriosam iste enim laborum! Autem nesciunt est quod rem corrupti. Dolorum ratione magnam omnis unde rem at modi ab quod, et id nulla ducimus, earum harum tempore esse hic doloribus fuga beatae quo eligendi voluptate. Beatae autem iure praesentium optio, officia sunt. Deserunt esse provident, labore quam aliquam asperiores suscipit? Quibusdam nobis accusantium dolorum recusandae veniam error incidunt dicta eaque quam? Incidunt perspiciatis optio fuga! Illo porro unde, cumque debitis, eligendi officiis illum fugiat atque consectetur, maxime eum sit earum nostrum aut soluta quaerat? Optio corrupti ipsa quos maiores tenetur suscipit, ipsam veritatis voluptatibus cumque mollitia. Consequatur numquam in ducimus aspernatur accusamus molestiae ipsa possimus eius eveniet, illum aut assumenda ad facere rerum delectus praesentium a magni sunt explicabo laboriosam hic. Officia, dolores voluptatum placeat vero cumque inventore ullam dicta esse commodi reprehenderit a ad magni fugit eos obcaecati maxime modi voluptate consequuntur sint neque iste itaque asperiores! Quos modi deleniti ea maxime at sunt quas doloribus omnis eum tempore saepe et aliquam dolorum, eos veritatis eligendi dignissimos voluptatibus illo quasi esse iure quibusdam? Molestiae quas quae enim id, quidem numquam accusamus nisi pariatur consequatur distinctio tenetur odit officia quos possimus beatae deserunt. Ab omnis quos repellat perferendis, recusandae vel quam suscipit rem quo soluta veritatis at impedit perspiciatis aspernatur similique magnam expedita quod corporis magni sunt. Suscipit eaque quae nobis, sint excepturi totam fugit nostrum nemo possimus. Aliquid, cum corrupti? Amet pariatur officia in facere ad mollitia eum numquam, voluptate sed nihil delectus saepe! Quibusdam nobis quae nihil. Est quam commodi delectus quia magni voluptas tempora voluptatum doloribus possimus voluptates voluptatibus soluta praesentium iste ullam ipsum accusamus perferendis, dolor enim blanditiis iusto recusandae vitae. Natus et vero laborum cupiditate, nisi vel mollitia incidunt deleniti quod? Quidem consequatur voluptatibus veritatis illo doloremque! Deleniti eos architecto, magnam nemo provident atque sapiente iste aut dolorum facere cupiditate aspernatur repellendus, unde dolor obcaecati molestias deserunt laboriosam nobis illum excepturi velit? Harum corporis eos, laudantium optio dicta magnam repellat beatae eveniet iste maxime vitae quis earum blanditiis officia obcaecati velit quae nulla molestiae error neque aut quidem consequatur ad ipsum? Sit voluptatem libero expedita hic voluptates enim omnis nostrum consectetur quo natus, porro autem officia laboriosam magnam! Vel odit quos qui quo consequatur alias? Aliquam ipsa repellendus necessitatibus doloremque, ipsum sint vel reprehenderit accusamus repellat at nesciunt, amet dolore quisquam laboriosam laborum. Consequatur qui nemo non rerum id quos voluptate laudantium corrupti unde repudiandae! Voluptas ad officia consequuntur qui amet in. Voluptatibus, minima suscipit cumque quod unde perspiciatis!";

  if (length > text.length) {
    return text;
  }

  return text.slice(0, length);
};

export function capitalizeEachWord(input: string): string {
  if (!input) return "";

  return input
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();
    const reader = new FileReader();

    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result as string);
    });

    reader.readAsDataURL(blob);

    return base64Promise;
  } catch (error) {
    console.error("Error fetching or encoding image:", error);
    throw error;
  }
}

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      const base64String = result.split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const replaceHTMLTagFromString = (str: string, slice?: number) =>
  str.replace(/(<([^>]+)>)/gi, "").slice(0, slice);

export function getKeyByValue<T>(object: Record<string, T>, value: T) {
  for (const key in object) {
    if (object[key] === value) {
      return key;
    }
  }
  return null; // If the value is not found
}
