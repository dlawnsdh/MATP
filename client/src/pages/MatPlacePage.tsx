import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import useAxios from "../hooks/useAxios";
import { getPosts, IPosts } from "../api/axiosAPI/posts/PostsAxios";
import { useParams } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import {
  getPickers,
  createPick,
  updatePick,
  deletePick,
} from "../api/axiosAPI/groups/PickersAxios";
import {
  getPlaceDetail,
  getPlaceDetailForUser,
} from "../api/axiosAPI/places/PlacesAxios";
import { PostRead, MatPostCreate, ModalPortal } from "../components";
import { useSetRecoilState } from "recoil";
import { placeInfoState, placeInfoStatusState } from "../store/placeInfoAtoms";
import basicLogoImg from "../assets/images/matLogo_fill.png";

const FeedContainer = styled.div`
  height: 100%;
  width: calc(1340px * 2 / 5 - 63px);
  z-index: 997;
  padding: 65px 8px 0px 70px;
  background-color: #f8f8f8;
  border-right: 1px solid #d7d9dc;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  .userInfo_header_container {
    display: flex;
    margin-bottom: 32px;
    justify-content: center;
    align-items: center;
  }
`;

const ImgContainer = styled.div`
  width: 132px;
  height: 132px;
  border-radius: 100%;
  margin: 32px 25px 0 25px;
  border: 1px solid #a6a6a6;
  flex: 0 0 132px;
  overflow: hidden;
`;
const PlaceImg = styled.img`
  width: 132px;
  height: 132px;
  object-fit: cover;
`;
const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 220px;

  h1 {
    color: #373737;
    font-size: 21px;
    margin-top: 52px;
    margin-bottom: 10px;
  }
`;

const StarBox = styled.span`
  color: #373737;
  font-size: 18px;
  margin: 10px 0;
  display: flex;

  .star_rating {
    color: #989898;
    position: relative;
    unicode-bidi: bidi-override;
    width: max-content;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke-width: 1.3px;
    -webkit-text-stroke-color: #fcc419;
    margin: 0px 10px 0px 0px;
  }

  .star_rating_fill {
    color: #fcc419;
    padding: 0;
    position: absolute;
    z-index: 1;
    display: flex;
    top: 0;
    left: 0;
    overflow: hidden;
    -webkit-text-fill-color: #fcc419;
  }

  .star_rating_base {
    z-index: 0;
    padding: 0;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  width: 150px;
  margin-top: 13px;
  justify-content: space-between;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  p {
    color: #373737;
    font-size: 18px;
    margin-top: 10px;
    text-align: center;
  }
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 17px;
    width: 74px;
    height: 34px;
    line-height: 34px;
    border: none;
    border-radius: 20px;
    color: #373737;
    background-color: transparent;
    cursor: pointer;
    &:hover {
      filter: brightness(0.8);
    }
    span {
      color: white;
    }
    .unchecking {
      display: none;
    }
  }
  .checking {
    color: white;
    background-color: #874356;
  }
`;

const CheckIconStyeld = styled(CheckIcon)`
  color: white;
  cursor: pointer;
  padding-bottom: 3px;
  padding-left: 5px;
`;

const PageContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  grid-gap: 4px;
  margin: 0px 0px 0px 0px;
  padding-top: 10px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
`;
const Nothing = styled.div`
  display: flex;
  justify-content: center;
  font-size: 1.5rem;
  margin-top: 10vh;
`;

const PickContainer = styled.div`
  color: #373737;
  width: 100%;
  height: 400px;
  h3 {
    flex: 100;
    font-size: 20px;
    text-align: center;
    margin: 30px 0;
  }
  #pick {
    font-weight: 700;
    background-color: rgb(200, 200, 200, 0.2);
    filter: brightness(0.8);
  }
`;

const NameBox = styled.button`
  display: flex;
  color: #373737;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 70px;
  padding: 15px;
  font-size: 18px;
  border: none;
  background-color: transparent;
  border-bottom: 1px solid #a6a6a6;

  .icon {
    width: 30px;
    height: 26px;
    margin-right: 13px;
    border-radius: 50%;
    background: url(${(props) => props.color || "gray"});
    background-size: 100%;
  }
  .click-part {
    cursor: pointer;
    width: 100%;
    text-align: start;
  }
  &:hover {
    background-color: #eeeeee;
  }
`;

const TabContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 0 -8px;
  border-top: 1px solid #dbdbdb;

  .tab_menu {
    font-size: 20px;
    width: 100%;
    text-align: center;
    cursor: pointer;
    padding: 14px 0;
    color: #a6a6a6;
    border-bottom: 2px solid #dbdbdb;
  }
  .present {
    color: #373737;
    border-bottom: 2px solid #373737;
  }
`;

const PlaceDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 70px;
  font-size: 19px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  h2 {
    font-size: 23px;
    margin-bottom: 30px;
  }
`;

const RatingsChart = styled.div`
  .card {
    padding: 30px 30px 20px 30px;
  }

  .rating-label {
    font-weight: bold;
    font-size: 15px;
  }

  .rating-box {
    width: 130px;
    height: 130px;
    margin-right: auto;
    margin-left: auto;
    background-color: #fcc419;
    color: #fff;
  }

  .rating-label {
    font-weight: bold;
  }

  /* Rating bar width */
  .rating-bar {
    width: 300px;
    padding: 4px;
    border-radius: 5px;
  }

  /* The bar container */
  .bar-container {
    width: 100%;
    background-color: #f1f1f1;
    text-align: center;
    color: white;
    border-radius: 20px;
  }

  /* Individual bars */
  .bar {
    height: 13px;
    background-color: #fcc419;
    border-radius: 20px;
  }

  td {
    padding: 0px 0px 8px 0px;
  }

  .rating-count {
    font-size: 15px;
  }
`;

const InfoBox = styled.div`
  width: 100%;
  margin-top: 25px;

  .five-pro {
    width: 100%;
    text-align: center;
    margin-bottom: 25px;
  }
  p {
    display: flex;
    margin: 18px;
    .info-title {
      width: 130px;
      font-weight: 600;
    }
    .info {
      width: 330px;
    }
  }
`;

const ModalBackdrop = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
`;

const groupImg = [
  "https://user-images.githubusercontent.com/94962427/214733213-a2c51280-6525-49ed-b60c-5e7e248890f8.svg",
  "https://user-images.githubusercontent.com/94962427/214733289-7588880b-0492-429f-9e7e-8dbc883a88a3.svg",
  "https://user-images.githubusercontent.com/94962427/214733318-efc109a4-439d-4b3a-b17e-ab478ff16102.svg",
  "https://user-images.githubusercontent.com/94962427/213092314-422f10bb-6285-420c-be93-913e252f75e6.svg",
];

const MatPlacePost: React.FC = () => {
  const { placeId } = useParams();
  const [isPost, setIsPost] = useState<boolean>(true);
  const [isPickers, setIsPickers] = useState<boolean>(false);
  const [isOpenModal, setOpenModal] = useState<boolean>(false);
  const [dataReload, setDataReload] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState(false);
  const [postsReload, setPostsReload] = useState<boolean>(false);

  useEffect(() => {
    localStorage.getItem("Authorization")
      ? setJwtToken(true)
      : setJwtToken(false);
  }, []);

  useEffect(() => {
    if (jwtToken) {
      getPlaceData();
      getPickersData();
      getPlaceDataUser();
    } else if (!jwtToken) {
      getPlaceData();
    }
  }, [dataReload]);

  const { axiosData: getPickersData, responseData: pickersData } = useAxios(
    () => getPickers(),
    [dataReload, postsReload],
    false
  );

  const { axiosData: getPlaceDataUser, responseData: placeUserData } = useAxios(
    () => getPlaceDetailForUser(Number(placeId)),
    [dataReload, postsReload],
    false
  );

  const { axiosData: getPlaceData, responseData: placeData } = useAxios(
    () => getPlaceDetail(Number(placeId)),
    [dataReload, placeId, postsReload],
    false
  );

  useEffect(() => {
    getPickersData();
  }, [postsReload, dataReload]);

  const getAllPostsReload = () => {
    setPostsReload(!postsReload);
  };

  const {
    id = 0,
    img = "",
    tel = "",
    address = "",
    zonecode = "",
    name = "",
    category = "",
    starAvg = 0,
    starCount = [],
    fiveStarProbability = 0,
    postCount = 0,
    pickCount = 0,
    posts = [],
  } = placeData || {};

  const { isPick = false, groupName = "" } = placeUserData || {};

  const pickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLDivElement;
    if (!isPick && target.id) {
      createPick(Number(placeId), Number(target.id));
      setDataReload(!dataReload);
    } else if (isPick && target.textContent === groupName) {
      deletePick(id);
      setDataReload(!dataReload);
    } else if (target.id && target.textContent !== groupName) {
      updatePick(Number(placeId), Number(target.id));
      setDataReload(!dataReload);
    }
  };

  const onClickToggleModal = useCallback(() => {
    setDataReload(!dataReload);
    setOpenModal(!isOpenModal);
  }, [isOpenModal]);

  const dataReloadHandler = useCallback(() => {
    setDataReload(!dataReload);
  }, [dataReload]);

  const ratingsTotal = starCount.reduce(
    (acc: number, cur: number) => (acc += cur),
    0
  );

  const ratingToPercent = {
    width: `${(starAvg / 5) * 100}%`,
  };

  const pickMenuHandler = () => {
    setIsPickers(!isPickers);
  };

  const postMenuHandler = () => {
    setIsPost(true);
  };

  const aboutMenuHandler = () => {
    setIsPost(false);
  };

  const ratingsAvg = (el: number) => {
    if (el > 0) {
      return (el / ratingsTotal) * 100;
    } else {
      return 0;
    }
  };

  const setPlaceInfo = useSetRecoilState(placeInfoState);
  const setPlaceInfoStatus = useSetRecoilState(placeInfoStatusState);
  useEffect(() => {
    if (placeData) {
      setPlaceInfoStatus("Loading");
      setPlaceInfo(placeData);
      setPlaceInfoStatus("Success");
    }
  }, [placeData, placeId]);

  return (
    <FeedContainer>
      {isOpenModal && (
        <ModalPortal>
          <MatPostCreate
            onClickToggleModal={onClickToggleModal}
            placeId={id}
            dataReloadHandler={dataReloadHandler}
          />
          <ModalBackdrop onClick={onClickToggleModal} />
        </ModalPortal>
      )}
      <div className="userInfo_header_container">
        <ImgContainer>
          <PlaceImg src={img || basicLogoImg} alt="프로필사진" />
        </ImgContainer>

        <PlaceInfo>
          <h1>{name}</h1>
          <StarBox>
            <div className="star_rating">
              <div className="star_rating_fill" style={ratingToPercent}>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <div className="star_rating_base">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>
            <div>{`(${starAvg.toFixed(1)})`}</div>
          </StarBox>
          <ButtonBox>
            <div className="pick-box">
              <button
                disabled={!jwtToken}
                className={isPick ? "checking" : ""}
                onClick={pickMenuHandler}
              >
                Pick <CheckIconStyeld className={!isPick ? "unchecking" : ""} />
              </button>
              <p>{pickCount}</p>
            </div>
            <div className="post-box">
              <button disabled={!jwtToken} onClick={onClickToggleModal}>
                Post
              </button>
              <p>{postCount}</p>
            </div>
          </ButtonBox>
        </PlaceInfo>
      </div>
      {isPickers ? (
        <PickContainer>
          <h3>맛픽커즈를 선택해 주세요</h3>
          {pickersData &&
            pickersData.map((picker: any) => (
              <NameBox
                id={`${isPick && picker.name === groupName ? "pick" : ""}`}
                key={picker.id}
                color={groupImg[picker.groupImgIndex]}
                onClick={pickHandler}
              >
                <div className="icon"></div>
                <div id={picker.id} className="click-part">
                  {picker.name}
                </div>
              </NameBox>
            ))}
        </PickContainer>
      ) : (
        <>
          <TabContainer>
            <div
              className={`tab_menu ${isPost ? "present" : ""}`}
              onClick={postMenuHandler}
              aria-hidden="true"
            >
              Post
            </div>
            <div
              className={`tab_menu ${!isPost ? "present" : ""}`}
              onClick={aboutMenuHandler}
              aria-hidden="true"
            >
              About
            </div>
          </TabContainer>
          {isPost ? (
            posts && posts.length !== 0 ? (
              <PageContainer>
                {posts.map((post: IPosts) => (
                  <PostRead
                    key={post.id}
                    post={post}
                    getAllPostsReload={getAllPostsReload}
                  />
                ))}
              </PageContainer>
            ) : (
              <Nothing>작성한 글이 없습니다!</Nothing>
            )
          ) : (
            <PlaceDetailInfo>
              <h2>{name}</h2>
              <RatingsChart>
                <div className="card">
                  <table>
                    <tbody>
                      <tr>
                        <td className="rating-label">Excellent</td>
                        <td className="rating-bar">
                          <div className="bar-container">
                            <div
                              className="bar"
                              style={{ width: `${ratingsAvg(starCount[4])}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="rating-count">{starCount[4]}</td>
                      </tr>
                      <tr>
                        <td className="rating-label">Good</td>
                        <td className="rating-bar">
                          <div className="bar-container">
                            <div
                              className="bar"
                              style={{ width: `${ratingsAvg(starCount[3])}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="rating-count">{starCount[3]}</td>
                      </tr>
                      <tr>
                        <td className="rating-label">Average</td>
                        <td className="rating-bar">
                          <div className="bar-container">
                            <div
                              className="bar"
                              style={{ width: `${ratingsAvg(starCount[2])}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="rating-count">{starCount[2]}</td>
                      </tr>
                      <tr>
                        <td className="rating-label">Poor</td>
                        <td className="rating-bar">
                          <div className="bar-container">
                            <div
                              className="bar"
                              style={{ width: `${ratingsAvg(starCount[1])}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="rating-count">{starCount[1]}</td>
                      </tr>
                      <tr>
                        <td className="rating-label">Terrible</td>
                        <td className="rating-bar">
                          <div className="bar-container">
                            <div
                              className="bar"
                              style={{ width: `${ratingsAvg(starCount[0])}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="rating-count">{starCount[0]}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </RatingsChart>
              <StarBox>
                <div className="star_rating">
                  <div className="star_rating_fill" style={ratingToPercent}>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <div className="star_rating_base">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>
                <div>{`(${starAvg.toFixed(1)})`}</div>
              </StarBox>
              <InfoBox>
                <div className="five-pro">
                  당신이 {name}에 5점을 줄 확률은 <br />{" "}
                  {Math.floor(fiveStarProbability)}%입니다!
                </div>
                <p>
                  <div className="info-title">카테고리 </div>
                  <div className="info">{category}</div>
                </p>
                <p>
                  <div className="info-title">전화번호 </div>
                  <div className="info">{tel === "" ? "미기재" : tel}</div>
                </p>
                <p>
                  <div className="info-title">주소 </div>
                  <div className="info">
                    {address}, {zonecode}
                  </div>
                </p>
              </InfoBox>
            </PlaceDetailInfo>
          )}
        </>
      )}
    </FeedContainer>
  );
};

export default MatPlacePost;
