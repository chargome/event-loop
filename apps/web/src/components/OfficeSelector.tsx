import React from "react";
import { useOffice, type Office } from "../contexts/OfficeContext";

const OFFICES: { code: Office; name: string; flag: string }[] = [
  { code: "VIE", name: "Vienna", flag: "🇦🇹" },
  { code: "SFO", name: "San Francisco", flag: "🇺🇸" },
  { code: "YYZ", name: "Toronto", flag: "🇨🇦" },
  { code: "AMS", name: "Amsterdam", flag: "🇳🇱" },
  { code: "SEA", name: "Seattle", flag: "🇺🇸" },
];

export function OfficeSelector() {
  const { selectedOffice, setSelectedOffice } = useOffice();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
        <span className="text-lg">
          {OFFICES.find((o) => o.code === selectedOffice)?.flag}
        </span>
        <span className="hidden sm:inline">
          {OFFICES.find((o) => o.code === selectedOffice)?.name}
        </span>
        <span className="sm:hidden">{selectedOffice}</span>
        <svg
          className="fill-current w-3 h-3"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-xl border border-base-300"
      >
        {OFFICES.map((office) => (
          <li key={office.code}>
            <button
              className={`flex items-center gap-3 ${
                selectedOffice === office.code ? "active" : ""
              }`}
              onClick={() => setSelectedOffice(office.code)}
            >
              <span className="text-lg">{office.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{office.name}</span>
                <span className="text-xs text-base-content/60">
                  {office.code}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function useSelectedOffice(): [Office, (office: Office) => void] {
  const { selectedOffice, setSelectedOffice } = useOffice();
  return [selectedOffice, setSelectedOffice];
}
