export type TacticalBoard = {
  type: string;
  name: string;
  url: string;
};

export type TacticalTeam = {
  name: string;
  color: string;
  totalMembers: number;
  members: TacticalMember[];
};

export type TacticalMember = {
  name: string;
  number: number;
};

export type TacticalStrategic = {
  [key: string]: {
    [key: string]: {
      x: number;
      y: number;
    };
  };
};
