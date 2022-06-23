import React, {useContext} from 'react'
import styled, {css} from 'styled-components'
import linkIcon from '../assets/icons/link_icon.png'
import linkIconWhite from '../assets/icons/link_icon_white.png'
import pinnedIcon from '../assets/icons/pinned_icon.png'
import arrowIcon from '../assets/icons/arrow_icon.png'
import arrowIconWhite from '../assets/icons/arrow_icon_white.png'
import { ThemeContext } from '../contexts/ThemeContext'

const axios = require('axios')

async function loadArticles() {
  const metadata = await getArticleMetadata()
  let final = []
  if (metadata === null) {
    return final
  }
  for (let i = 0; i < metadata.length; i++) {
    try {
      const response = axios.get('https://storage.googleapis.com/gard-dot-money/' + metadata[i]["image"])
      final.push(metadata[i])
      final[final.length-1]["image"] = 'https://storage.googleapis.com/gard-dot-money/' + metadata[i]["image"]
    }
    catch (ex) {
      console.log(ex)
    }
  }
  return final
}

async function getArticleMetadata() {
  let response;
  try {
    response = await axios.get('https://storage.googleapis.com/gard-dot-money/article_info.json')
  } catch (ex) {
    response = null
    console.log(ex)
  }
  if (response) {
    return response.data["data"]
  }
  return null
}
/**
 * Content found on home
 */
export default function HomeContent() {
  const {theme} = useContext(ThemeContext)
  return (
    <div style={{}}>
      <div style={{ paddingBottom: 40 }}>
        <div style={{ paddingBottom: 27 }}>
          <Title>Welcome!</Title>
        </div>
        <div style={{ paddingBottom: 29 }}>
          <Subtitle>
            Welcome to the GARD protocol Web App! This is the MainNet application. Transactions made through this app are final and cannot
            be undone. 
          </Subtitle>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ paddingRight: 56 }}>
            <LinkButton
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => {
                window.open('https://algogard.com/')
              }}
            >
              <div style={{ paddingRight: 15 }}>
                <LinkButtonText darkToggle={theme === 'dark'}>View Website</LinkButtonText>
              </div>
              <div>
                {theme === 'light' ? <img src={linkIcon} alt="link-icon" />: <img src={linkIconWhite} alt="link-icon-white" /> }
              </div>
            </LinkButton>
          </div>
          <div>
            <LinkButton
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={() => {
                window.open('https://algogard.com/white-paper.pdf')
              }}
            >
              <div style={{ paddingRight: 15 }}>
                <LinkButtonText darkToggle={theme === 'dark'}>Read White Paper</LinkButtonText>
              </div>
              <div>
                {theme === 'light' ? <img src={linkIcon} alt="link-icon" />: <img src={linkIconWhite} alt="link-icon-white" /> }
              </div>
            </LinkButton>
          </div>
        </div>
      </div>
      <div>
        <div style={{ paddingBottom: 26 }}>
          <Title>Recent News</Title>
        </div>
        <div>
          {news.map((v, i) => {
            return (
              <div key={i} style={{ marginBottom: 24 }}>
                {v.pinned ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginRight: 4,
                      }}
                    >
                      <img src={pinnedIcon} alt="pinned-icon" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <PinnedText>Pinned Article</PinnedText>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ marginRight: 25 }}>
                    <NewsImage src={v.image} alt="" />
                  </div>
                  <div style={{ paddingTop: 8, paddingBottom: 16 }}>
                    <div style={{ paddingBottom: 4 }}>
                      <NewsHeadline>{v.title}</NewsHeadline>
                    </div>
                    <div style={{ paddingBottom: 13, height: 60 }}>
                      <Paragraph>{v.text}</Paragraph>
                    </div>
                    <div>
                      <LinkButton
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <div style={{ paddingRight: 15 }}>
                          <LinkButtonTextBold
                            darkToggle={theme === 'dark'}
                            onClick={() => window.open(v.link)}
                          >
                            Read More
                          </LinkButtonTextBold>
                        </div>
                        <div>
                        {theme === 'light' ? <img src={arrowIcon} alt="arrow-icon" />: <img src={arrowIconWhite} alt="arrow-icon-white" /> }
                        </div>
                      </LinkButton>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// styled components
const Title = styled.text`
  font-size: 30px;
  font-weight: 700;
`
const Subtitle = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`
const Paragraph = styled.text`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

const LinkButton = styled.button`
  height: 20px;
  border-width: 0;
  background-color: transparent;
  cursor: pointer;
`

const LinkButtonText = styled.text`
  font-weight: normal;
  font-size: 14px;
  ${(props) =>
    props.darkToggle &&
    css`
      color: #99b2ff;
  `}
  ${LinkButton}:hover & {
    text-decoration: underline;
  }
`

const PinnedText = styled.text`
  font-weight: 500;
  font-size: 12px;
`

const NewsImage = styled.img`
  height: 148px;
  width: 148px;
  object-fit: cover;
`

const NewsHeadline = styled.text`
  font-weight: bold;
  font-size: 20px;
`
const LinkButtonTextBold = styled.text`
  font-weight: bold;
  font-size: 14px;
  ${(props) =>
    props.darkToggle &&
    css`
      color: #99b2ff;
  `}
`

// dummy data for news headlines

const news = await loadArticles()
