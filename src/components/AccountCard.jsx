import React, { useState } from "react";
import styled from "styled-components";
import ToolTip from "./ToolTip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { getBalances } from "./swap/swapHelpers";
import * as tips from "../assets/tooltiptext"
import { gardID } from "../transactions/ids";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import gardIcon from "../assets/icons/gardlogo_icon_small.png"
import PrimaryButton from "./PrimaryButton";

const theme = createTheme({
  components: {
    AccountCard: {
      styleOverrides: {
        root: {
          background: "#0f1733",
        },
      },
    },
  },
});

const menuStyle = {
  color: "#01c7f3"
}

const balances = getBalances();

export default function AccountCard({walletAddress, connectFn, disconnectFn}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return <div>
    <ThemeProvider theme={theme}>
    <PrimaryButton
      text={walletAddress || "Connect Wallet"}
      onClick={() => connectFn()}
      />
    <IconButton
      onClick={handleClick}
      size="small"
      sx={{ ml: 2 }}
      aria-controls={open ? 'account-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
    >
      <AvatarBox>
        <GardIcon src={gardIcon} />
      </AvatarBox>

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
          bgcolor: '#0f1733',
          color: "#ffffff",
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
            bgcolor: '#0f1733',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
          "[opt]" : {
            border: "1px solid #01c7f3"
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem opt onClick={() => window.open("http://localhost:3000/account", "_self")} >
      <AvatarBox>
        <GardIcon src={gardIcon} />
        <Text>View Wallet</Text>
      </AvatarBox>
      </MenuItem>
      <Divider />
      <MenuItem>
        Asset Balances:
      </MenuItem>
      <MenuItem opt>
        <IconButton style={menuStyle}  onClick={() => window.open("https://algoexplorer.io/")} >ALGO: {balances['algo']}</IconButton>
      </MenuItem>
      <MenuItem opt>
        <IconButton style={menuStyle}  onClick={() => window.open("https://algoexplorer.io/asset/" + gardID)}>GARD: {balances['gard']}</IconButton>
      </MenuItem>
    </Menu>
    </ThemeProvider>
    </div>;
}

const AvatarBox = styled.div`
  display: flex;
  /* justify-content: space-evenly; */
  height: 25px;
  width: 25px;
  object-fit: contain;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`
const GardIcon = styled.img`
  width: auto;
  max-height: 100%;
  margin-right: 8px;
`
const Text = styled.text`

`
