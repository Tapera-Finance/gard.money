import React, {useContext, useEffect} from 'react'
import styled, {css} from 'styled-components'
import linkIcon from '../assets/icons/link_icon.png'
import linkIconWhite from '../assets/icons/link_icon_white.png'
import pinnedIcon from '../assets/icons/pinned_icon.png'
import arrowIcon from '../assets/icons/arrow_icon.png'
import arrowIconWhite from '../assets/icons/arrow_icon_white.png'
import { ThemeContext } from '../contexts/ThemeContext'
import { useState } from 'react'

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

const combineInfinite = async () => {
  let examples = []
  const currentArticles = await loadArticles();
  for (var i = 0; i < currentArticles.length; i++) {
    examples.push(currentArticles[i]);
  }

}
/**
 * @param {number} - limit of articles to load at once
 * @param {object[]} - article container
 *
 */

const dummyArticles = [
  {
    title: "Digital Card Game on Algorand",
    text: "Aegir Tactics is a digital card game which uses Algorand for its payment and asset infrastructure. It chose Algorand due to the speed, cost, reliability, security, and no forking guarantees.",
    image: "Aegir.png",
    link: "https://medium.com/algorand/why-digital-card-game-aegir-tactics-chose-algorand-740359219d95",
    pinned:	false
  },
  {
    title: "Nigeria to Launch Major Crypto Initiative on Algorand",
    text: "The Nigerian government has pledged to a three-year exclusive pact with the Emerging Africa Group to build a national wallet that will allow the international commercialization of any IP forms created and registered in Nigeria, both locally and globally.",
    image: "Africa.png",
    link: "https://www.prnewswire.com/news-releases/nigeria-to-launch-major-crypto-initiative-ip-exchange-marketplace-and-wallet-on-algorand-in-partnership-with-developing-africa-group-and-koibanx-301553306.html",
    pinned: false
  },
  {
    title: "A Beginner's Guide to Algorand",
    text: "Algorand is the world’s first proof-of-stake (PoS) blockchain, aiming to solve the “Blockchain Trilemma” of avoiding tradeoffs between speed, security, and decentralization. The project competes with the likes of Ethereum and other layer 1s for developer and user activity, boasting a network of 13 dapps.",
    image: "AA.png",
    link: "https://coincentral.com/what-is-algorand-algo-a-beginners-guide-on-the-algorand-project/",
    pinned: false
  },
  {
    title:"Anthony Scaramucci takes large position in Algorand",
    text: "SkyBridge Capital head Anthony Scaramucci recently indicated that he had taken a large position in Algorand (ALGO). Recently, Scaramucci has been very bullish on Algorand’s impressive technology created by Italian computer scientist Silvio Micali.",
    image: "As.png",
    link: "https://u.today/anthony-scaramucci-takes-large-position-in-algorand-algo",
    pinned: false
  },

  {
    title: "Record Inflows on Algorand",
    text: "According to digital asset management firm CoinShares, Algorand-based institutional investment products had a record-breaking $20 million in inflows in the preceding week. ",
    image: "Algorand.png",
    link: "https://u.today/algorand-funds-see-record-breaking-weekly-inflows",
    pinned: false
  },
  {
    title: "Algorand is dope. Period.",
    text: "Latest analysis of blockchain survey data and overheard at picnic tables in New Jersey suburbs on July 4th weekend confirm what many have already known what was coming: Algorand is a 'dopecoin'",
    image: "As.png",
    link: "https://genrandom.com/cats/",
    pinned: true
  },
  {
    title: "Looking back: Lou Reed loved journalists, apparently",
    text: "When asked why he wrote about drugs, Mr. Reed responded 'I don't.' 'I love journalists though, thank you for asking me important questions.' The press was shocked to hear this following many long pauses of silence Mr. Reed took as answers to other questions. Mr. Reed was seen wearing cool sunglasses in this interview, conducted in 1974.",
    image: 'As.png',
    link: "https://www.youtube.com/watch?v=IeMIWCxHgQk",
    pinned: false
  },
  {
    title: "ASSHASKDHOASKMDO Card Game on Algorand",
    text: "Aegir Tactics is a dAAAAAAAAAAAAAA for its payment and asset infrastructure. It chose Algorand due to the speed, cost, reliability, security, and no forking guarantees.",
    image: "Aegir.png",
    link: "https://medium.com/algorand/why-digital-card-game-aegir-tactics-chose-algorand-740359219d95",
    pinned:	false
  },
  {
    title: "DSFDSOJFDS Initiative on Algorand",
    text: "The vdfbvfdvf overnment has pledged to a three-year exclusive pact with the Emerging Africa Group to build a national wallet that will allow the international commercialization of any IP forms created and registered in Nigeria, both locally and globally.",
    image: "Africa.png",
    link: "https://www.prnewswire.com/news-releases/nigeria-to-launch-major-crypto-initiative-ip-exchange-marketplace-and-wallet-on-algorand-in-partnership-with-developing-africa-group-and-koibanx-301553306.html",
    pinned: false
  },
  {
    title: "10",
    text: "Algorandvfrvgefv erproof-of-stake (PoS) blockchain, aiming to solve the “Blockchain Trilemma” of avoiding tradeoffs between speed, security, and decentralization. The project competes with the likes of Ethereum and other layer 1s for developer and user activity, boasting a network of 13 dapps.",
    image: "AA.png",
    link: "https://coincentral.com/what-is-algorand-algo-a-beginners-guide-on-the-algorand-project/",
    pinned: false
  },
  {
    title: "11",
    text: "Aegir Tactics is a digital card game which uses Algorand for its payment and asset infrastructure. It chose Algorand due to the speed, cost, reliability, security, and no forking guarantees.",
    image: "Aegir.png",
    link: "https://medium.com/algorand/why-digital-card-game-aegir-tactics-chose-algorand-740359219d95",
    pinned:	false
  },
  {
    title: "12",
    text: "The Nigerian government has pledged to a three-year exclusive pact with the Emerging Africa Group to build a national wallet that will allow the international commercialization of any IP forms created and registered in Nigeria, both locally and globally.",
    image: "Africa.png",
    link: "https://www.prnewswire.com/news-releases/nigeria-to-launch-major-crypto-initiative-ip-exchange-marketplace-and-wallet-on-algorand-in-partnership-with-developing-africa-group-and-koibanx-301553306.html",
    pinned: false
  },
  {
    title: "13",
    text: "Algorand is the world’s first proof-of-stake (PoS) blockchain, aiming to solve the “Blockchain Trilemma” of avoiding tradeoffs between speed, security, and decentralization. The project competes with the likes of Ethereum and other layer 1s for developer and user activity, boasting a network of 13 dapps.",
    image: "AA.png",
    link: "https://coincentral.com/what-is-algorand-algo-a-beginners-guide-on-the-algorand-project/",
    pinned: false
  },
  {
    title:"14",
    text: "SkyBridge Capital head Anthony Scaramucci recently indicated that he had taken a large position in Algorand (ALGO). Recently, Scaramucci has been very bullish on Algorand’s impressive technology created by Italian computer scientist Silvio Micali.",
    image: "As.png",
    link: "https://u.today/anthony-scaramucci-takes-large-position-in-algorand-algo",
    pinned: false
  },

  {
    title: "15",
    text: "According to digital asset management firm CoinShares, Algorand-based institutional investment products had a record-breaking $20 million in inflows in the preceding week. ",
    image: "Algorand.png",
    link: "https://u.today/algorand-funds-see-record-breaking-weekly-inflows",
    pinned: false
  },

]



/**
 * Content found on home
 */
export default function HomeContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [newsItems, setNewsItems] = useState([dummyArticles[0], dummyArticles[1], dummyArticles[2], dummyArticles[3], dummyArticles[4]])
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1)
  const limit = 5
  const {theme} = useContext(ThemeContext)

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function handleScroll(e) {
    window.onscroll = function (e) {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        setPage(page + 1);
      }
      console.log("Fetch more")
      setIsLoading(true)
    }
  }

  useEffect(() => {
    if (!isLoading) return
    loadMoreItems();
  }, [isLoading])

  function loadMoreItems() {
    setCount(count => count += 1)
    let news = formatNews(limit, count, dummyArticles)
    setNewsItems(news)
    setIsLoading(false)
  }

  // 7 articles long
  // if i is 1, remove articles[0], push articles[6]
  // if i is 2, remove articles[1], push articles[7]
  // if i is 3, remove articles[2], push articles[8]
  // if i is 4, limit should be 9 remove articles[3], push articles[9]
  // if i is 5, limit should be 10, remove articles[4], push articles[10]
  // if i is 6, limit


function formatNews(limit, idx, articles) {
    let newsContainer = newsItems
    let end = limit + idx
    for (var start = idx; start <= end; start++) {
     if (!((start + limit) >= articles.length)) {
        // newsContainer.shift(articles[start])
        newsContainer.push(articles[start + limit])
      }
      return newsContainer
    }
  }

  // if isLoading, setCount(count + 1) formatNews(5, count, newsArr)

  // infinite scroll is happening in one direction at the container level
  // next step is to isolate container and add scrollbar and
  // allow scrolling up / maybe dont shift articles off the top


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
        <div  >
          {newsItems.length > 0 && newsItems.map((v, i) => {
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
          {isLoading && 'Loading...'}
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
