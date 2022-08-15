import React, { useState } from "react";
import styled from "styled-components";
import ToolTip from "./ToolTip";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { getBalances } from "./swap/swapHelpers";
import * as tips from "../assets/tooltiptext"
import { titleToToolTip } from "../utils";
import { gardID } from "../transactions/ids";

const balances = getBalances();

export default function AccountCard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return <div>
    <ToolTip toolTip="Account Info" toolTipText={tips[titleToToolTip("Account Info")]} />
    <IconButton
      onClick={handleClick}
      size="small"
      sx={{ ml: 2 }}
      aria-controls={open ? 'account-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
    >
      <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
    </IconButton>
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem>
        <Avatar/> Wallet
      </MenuItem>
      <Divider />
      <MenuItem>
        Asset Balances:
      </MenuItem>
      <MenuItem>
        <IconButton onClick={() => window.navigator.navigate("https://algoexplorer.io/")} >ALGO: {balances['algo']}</IconButton>
      </MenuItem>
      <MenuItem>
        <IconButton onClick={() => window.navigator.navigate("https://algoexplorer.io/asset/" + gardID)}>GARD: {balances['gard']}</IconButton>
      </MenuItem>
    </Menu>
    </div>;
}
