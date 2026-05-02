"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface BuildingContextValue {
  buildingId: string | null;
  buildingName: string | null;
  setBuilding: (id: string, name: string) => void;
  clearBuilding: () => void;
}

const BuildingContext = createContext<BuildingContextValue>({
  buildingId: null,
  buildingName: null,
  setBuilding: () => {},
  clearBuilding: () => {},
});

export function BuildingProvider({ children }: { children: React.ReactNode }) {
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [buildingName, setBuildingName] = useState<string | null>(null);

  useEffect(() => {
    setBuildingId(localStorage.getItem("building_id"));
    setBuildingName(localStorage.getItem("building_name"));
  }, []);

  function setBuilding(id: string, name: string) {
    localStorage.setItem("building_id", id);
    localStorage.setItem("building_name", name);
    setBuildingId(id);
    setBuildingName(name);
  }

  function clearBuilding() {
    localStorage.removeItem("building_id");
    localStorage.removeItem("building_name");
    setBuildingId(null);
    setBuildingName(null);
  }

  return (
    <BuildingContext.Provider value={{ buildingId, buildingName, setBuilding, clearBuilding }}>
      {children}
    </BuildingContext.Provider>
  );
}

export const useBuilding = () => useContext(BuildingContext);
