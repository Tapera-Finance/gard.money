import { createGlobalStyle } from "styled-components"
import { px2vw } from "../utils"

// define viewport sizes
export const size = {
  mobileS: "320px",
  mobileM: "375px",
  mobileL: "425px",
  tablet: "768px",
  laptop: "1024px",
  laptopL: "1440px",
  desktop: "2560px"
}

export const device = {
  mobileS: `(max-width: ${size.mobileS})`,
  mobileM: `(max-width: ${size.mobileM})`,
  mobileL: `(max-width: ${size.mobileL})`,
  tablet: `(max-width: ${size.tablet})`,
  laptop: `(max-width: ${size.laptop})`,
  laptopL: `(max-width: ${size.laptopL})`,
  desktop: `(max-width: ${size.desktop})`
}

// export const Global = createGlobalStyle`
//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//   }
//   :root {
//     font-size: ${px2vw(24)};

//     @media (${device.tablet}) {
//       font-size: ${px2vw(18)};
//     }

//     @media (${device.laptop}) {
//       font-size: ${px2vw(16)}
//     }
//   }
// `
