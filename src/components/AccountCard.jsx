import React, { useState } from "react";
import styled from "styled-components";
import ToolTip from "./ToolTip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { getBalances } from "./actions/swapHelpers";
import * as tips from "../assets/tooltiptext";
import { ids } from "../transactions/ids";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import gardIcon from "../assets/icons/gardlogo_icon_small.png";
import PrimaryButton from "./PrimaryButton";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import WalletConnect from "./WalletConnect";
import { size, device } from "../styles/global"

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
  color: "#01c7f3",
};

const balances = getBalances();

export default function AccountCard() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const walletAddress = useSelector((state) => state.wallet.address);

  const handleClick = (e) => {
    if (!walletAddress) {
      return
    }
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <BtnContainer>
          <WalletConnect />

          {walletAddress ? (
            <IconButtonContainer>
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                  >
                  <AvatarBox
                    style={{
                      background: "#0f1733",
                      border: "1px solid #01d1ff",
                      borderRadius: "20px",
                      width: "40px",
                      height: "40px",
                      padding: "2px 0px 2px 8px",
                    }}
                    >
                    <GardIcon src={gardIcon} />
                  </AvatarBox>
                </div>
              </IconButton>
            </IconButtonContainer>
          ) : (
            <></>
          )}
        </BtnContainer>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              bgcolor: "#0f1733",
              color: "#ffffff",
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "#0f1733",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
              "[opt]": {
                border: "1px solid #01c7f3",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem opt onClick={() => navigate("/account")}>
            <AvatarBox>
              <GardIcon src={gardIcon} />
              <Text>View Wallet</Text>
            </AvatarBox>
          </MenuItem>
          <Divider />
          <MenuItem>Asset Balances:</MenuItem>
          <MenuItem opt>
            {balances ? (
              <IconButton
                style={menuStyle}
                onClick={() => window.open("https://algoexplorer.io/")}
              >
                ALGO: {balances["algo"]}
              </IconButton>
            ) : (
              <></>
            )}
          </MenuItem>
          <MenuItem opt>
            {balances ? (
              <IconButton
                style={menuStyle}
                onClick={() =>
                  window.open("https://algoexplorer.io/asset/" + ids.asa.gard)
                }
              >
                GARD: {balances["gard"]}
              </IconButton>
            ) : (
              <></>
            )}
          </MenuItem>
        </Menu>
      </ThemeProvider>
    </div>
  );
}

const BtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  @media (${device.mobileL}) {
    display: unset;
  }
`

const AvatarBox = styled.div`
  display: flex;
  /* justify-content: space-evenly; */
  height: 25px;
  width: 25px;
  object-fit: contain;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;
const GardIcon = styled.img`
  width: auto;
  max-height: 100%;
  margin-right: 8px;
`;
const Text = styled.text``;

const IconButtonContainer = styled.div`
display: flex;
align-items: center;
  @media (max-width: 542px) {
    visibility: hidden;
  }
`
