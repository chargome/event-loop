import React from "react";

export type Office = "VIE" | "SFO" | "YYZ" | "AMS" | "SEA";

interface OfficeContextType {
  selectedOffice: Office;
  setSelectedOffice: (office: Office) => void;
}

const OfficeContext = React.createContext<OfficeContextType | undefined>(
  undefined
);

export function OfficeProvider({ children }: { children: React.ReactNode }) {
  const [selectedOffice, setSelectedOfficeState] = React.useState<Office>(
    () => {
      const saved = localStorage.getItem("selectedOffice") as Office | null;
      return saved || "VIE";
    }
  );

  const setSelectedOffice = React.useCallback((office: Office) => {
    setSelectedOfficeState(office);
    localStorage.setItem("selectedOffice", office);
  }, []);

  return (
    <OfficeContext.Provider value={{ selectedOffice, setSelectedOffice }}>
      {children}
    </OfficeContext.Provider>
  );
}

export function useOffice() {
  const context = React.useContext(OfficeContext);
  if (!context) {
    throw new Error("useOffice must be used within an OfficeProvider");
  }
  return context;
}
