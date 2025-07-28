import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { showToast } from "@vendetta/ui/toasts";

const UserStore = findByProps("getCurrentUser");
const UserActions = findByProps("forceUpdateUser");

const BADGES = {
  "Discord Staff": 1 << 0,
  "Partner": 1 << 1,
  "HypeSquad Events": 1 << 2,
  "Bug Hunter Level 1": 1 << 3,
  "HypeSquad Bravery": 1 << 6,
  "HypeSquad Brilliance": 1 << 7,
  "HypeSquad Balance": 1 << 8,
  "Early Supporter": 1 << 9,
  "Bug Hunter Level 2": 1 << 14,
  "Verified Bot Developer": 1 << 17,
};

let interval = null;

function applyBadges() {
  const user = UserStore.getCurrentUser();
  if (!user) return;

  user.flags = 0;
  for (const badge of storage.selectedBadges || []) {
    user.flags |= BADGES[badge] || 0;
  }
  UserActions.forceUpdateUser(user.id);
}

export default {
  onLoad: () => {
    if (!storage.selectedBadges) storage.selectedBadges = [];

    interval = setInterval(() => {
      const user = UserStore.getCurrentUser();
      if (user) {
        clearInterval(interval);
        applyBadges();
        showToast(`✅ ${storage.selectedBadges.length} badge(s) appliqué(s)`, "success");
      }
    }, 300);
  },

  onUnload: () => {
    clearInterval(interval);
    const user = UserStore.getCurrentUser();
    if (!user) return;

    for (const flag of Object.values(BADGES)) {
      user.flags &= ~flag;
    }
    UserActions.forceUpdateUser(user.id);
    showToast("❌ Tous les badges désactivés", "default");
  },

  settings: {
    getSettingsPanel: () => {
      const React = require("react");
      const { View, Text, ScrollView, Switch } = require("react-native");

      return React.createElement(
        ScrollView,
        { style: { padding: 15 } },
        ...Object.entries(BADGES).map(([name]) =>
          React.createElement(
            View,
            { key: name, style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 } },
            React.createElement(Text, { style: { fontSize: 16 } }, name),
            React.createElement(Switch, {
              value: storage.selectedBadges?.includes(name),
              onValueChange: (value) => {
                if (value) {
                  storage.selectedBadges = [...(storage.selectedBadges || []), name];
                } else {
                  storage.selectedBadges = storage.selectedBadges?.filter(b => b !== name);
                }
                applyBadges();
              },
            })
          )
        )
      );
    },
  },
};
