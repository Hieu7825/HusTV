// client/src/components/Footer.jsx
import React from "react";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    // lay tu prebuiltui
    // https://prebuiltui.com/components/footer
    <footer
      className="px-6 md:px-16 lg:px-36 mt-10 w-full"
      style={{
        color: "var(--color-text-secondary)",
        borderBottomColor: "var(--color-border-primary)",
      }}
    >
      <div
        className="flex flex-col md:flex-row justify-between w-full gap-10 border-b pb-14"
        style={{ borderColor: "var(--color-border-secondary)" }}
      >
        <div className="md:max-w-96">
          <img alt="" className="h-30 -mt-10 -mb-5" src={assets.logo} />
          <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <img
              src={assets.googlePlay}
              alt="google play"
              className="h-9 w-auto hover:opacity-80 transition-opacity"
            />
            <img
              src={assets.appStore}
              alt="app store"
              className="h-9 w-auto hover:opacity-80 transition-opacity"
            />
          </div>
        </div>
        <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
          <div>
            <h2
              className="font-semibold mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Company
            </h2>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-opacity-100"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-opacity-100"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-opacity-100"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Contact us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-opacity-100"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Privacy policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2
              className="font-semibold mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Get in touch
            </h2>
            <div className="text-sm space-y-2">
              <p style={{ color: "var(--color-text-secondary)" }}>
                +1-234-567-890
              </p>
              <p style={{ color: "var(--color-text-secondary)" }}>
                contact@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
      <p
        className="pt-4 text-center text-sm pb-5"
        style={{ color: "var(--color-text-muted)" }}
      >
        bản quyền {new Date().getFullYear()} © Nguyễn Minh Hiếu.
      </p>
    </footer>
  );
};

export default Footer;
