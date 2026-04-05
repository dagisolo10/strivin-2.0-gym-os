import add from "../../assets/icons/add.png";
import back from "../../assets/icons/back.png";
import logo from "../../assets/icons/logo.png";
import home from "../../assets/icons/home.png";
import menu from "../../assets/icons/menu.png";
import plus from "../../assets/icons/plus.png";
import adobe from "../../assets/icons/adobe.png";
import figma from "../../assets/icons/figma.png";
import claude from "../../assets/icons/claude.png";
import github from "../../assets/icons/github.png";
import medium from "../../assets/icons/medium.png";
import notion from "../../assets/icons/notion.png";
import openai from "../../assets/icons/openai.png";
import wallet from "../../assets/icons/wallet.png";
import dropbox from "../../assets/icons/dropbox.png";
import setting from "../../assets/icons/setting.png";
import spotify from "../../assets/icons/spotify.png";
import activity from "../../assets/icons/activity.png";

export const icons = {
    home,
    wallet,
    setting,
    activity,
    logo,
    add,
    back,
    menu,
    plus,
    notion,
    dropbox,
    openai,
    adobe,
    medium,
    figma,
    spotify,
    github,
    claude,
} as const;

export type IconKey = keyof typeof icons;
