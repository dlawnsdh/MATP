import styled from "styled-components";
import useAxios from "../../hooks/useAxios";
import { useEffect, useState } from "react";
import {
  deletePost,
  likePost,
  dislikePost,
} from "../../api/axiosAPI/posts/PostsAxios";
import StarRate from "./StarRate";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MatCommentList from "./MatCommentList";
import { MatPostUpdate } from "..";
import { useNavigate } from "react-router";
import { Popover, Typography } from "@mui/material";
import moment from "moment";
import "moment/locale/ko";
import axios from "axios";
import instance from "../../api/CustomAxios";
import { IComments } from "../../api/axiosAPI/comments/commentsAxios";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../store/userInfoAtoms";

const jwtToken = localStorage.getItem("Authorization");

const StyledModal = styled.div`
  border-radius: 10px;
  background-color: #ffffff;
  width: 80vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 5vh;
  left: 10vw;
  z-index: 10000;

  > span.close-btn {
    position: absolute;
    top: 1vh;
    right: 1vw;
    cursor: pointer;
    font-size: 30px;
  }
`;

const StyledDiv = styled.div`
  margin: 7vh 10vw;
  @media screen and (max-width: 1080px) {
    margin: 5vh 7vw;
  }
  display: flex;
  flex-direction: column;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  .post_like {
    cursor: pointer;
    padding: 7px 9px 0 0;
  }
`;
const FavoriteIconStyled = styled(FavoriteIcon)`
  color: #c65d7b;
`;
const FavoriteBorderIconStyled = styled(FavoriteBorderIcon)`
  color: #c65d7b;
`;

const StyledContentWrapper = styled.div`
  margin: 10px 0px 10px 0px;
  display: flex;
  flex-direction: column;

  .post_title {
    font-size: 35px;
    margin: 0px 0px 15px 0px;
  }
`;

const StyledMid = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0px 0px 20px 0px;
  margin: 0px 0px 20px 0px;
  border-bottom: 1px solid #cacaca;

  button {
    border: none;
    background-color: transparent;
    color: #727272;
    cursor: pointer;
  }

  .disabled {
    display: none;
  }
`;

const StyledInfo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .post_nickname {
    font-size: 15px;
    margin: 0px 10px 0px 0px;
  }

  .post_createdAt {
    font-size: 14px;
  }
`;
const ImgContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0px 10px 0px 0px;
  overflow: hidden;
  img {
    width: 32px;
    height: 32px;
    object-fit: cover;
  }
`;

const StyledContent = styled.div`
  margin: 0px 0px 5px 0px;
  padding: 1px 0px 0px 0px;
  line-height: 23px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const StyledStarsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledStar = styled.div`
  display: flex;
  width: 125px;
  padding: 5px 0px 0px 0px;

  & svg {
    color: #989898;
  }

  .yellow {
    color: #fcc419;
  }
`;

// ?????? ?????? ?????? ?????? (?????? ??????)
interface ModalDefaultType {
  onClickToggleModal: () => void;
  id: number;
}

const PostReadModal = ({
  onClickToggleModal,
  id,
}: ModalDefaultType): JSX.Element => {
  const userInfo = useRecoilValue(userInfoState);
  const [nickname, setNickname] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [star, setStar] = useState<number>(0);
  const [placeId, setPlaceId] = useState<number>(0);
  const [comments, setComments] = useState<IComments[]>([]);
  const [isLikesCheck, setIsLikesCheck] = useState<boolean>(false);
  const [deleteClicked, setDeleteClicked] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  // popover ref
  const [anchorEL, setAnchorEL] = useState(null);
  // comment ????????? ???????????? ??????(reload ??????)
  const [commentReload, setCommentReload] = useState<boolean>(null);

  // matPostUdate??? navigate?????? ?????? ??????
  const navigate = useNavigate();

  // ?????? Post data get
  useEffect(() => {
    if (jwtToken) {
      instance
        .get(`/places/1/posts/${id}`)
        .then((res) => {
          setNickname(res.data.postInfo.memberInfo.nickname);
          setProfileUrl(res.data.postInfo.memberInfo.profileUrl);
          setTitle(res.data.postInfo.title);
          setContent(res.data.postInfo.content);
          setCreatedAt(res.data.postInfo.createdAt);
          setStar(res.data.postInfo.star);
          setPlaceId(res.data.postInfo.placeId);
          setComments(res.data.comments);
          setIsLikesCheck(res.data.isLikesCheck);
        })
        .catch(function (error) {
          throw error;
        });
    } else if (!jwtToken) {
      axios
        .get(`https://matp.o-r.kr/places/1/posts/${id}`)
        .then((res) => {
          setNickname(res.data.postInfo.memberInfo.nickname);
          setProfileUrl(res.data.postInfo.memberInfo.profileUrl);
          setTitle(res.data.postInfo.title);
          setContent(res.data.postInfo.content);
          setCreatedAt(res.data.postInfo.createdAt);
          setStar(res.data.postInfo.star);
          setPlaceId(res.data.postInfo.placeId);
          setComments(res.data.comments);
          setIsLikesCheck(res.data.isLikesCheck);
        })
        .catch(function (error) {
          throw error;
        });
    }
  }, []);

  // comment list update
  useEffect(() => {
    axios
      .get(`https://matp.o-r.kr/places/1/posts/${id}`)
      .then((res) => {
        setComments(res.data.comments);
        setCommentReload(false);
      })
      .catch(function (error) {
        throw error;
      });
  }, [commentReload]);

  // post ??????
  const { axiosData: deleteP } = useAxios(
    () => deletePost(id, placeId),
    [deleteClicked],
    true
  );

  //'?????????'
  const { axiosData: likeP } = useAxios(() => likePost(id, placeId), [], true);

  // '?????????' ??????
  const { axiosData: dislikeP } = useAxios(
    () => dislikePost(id, placeId),
    [],
    true
  );

  // matPostUpdate ??????????????? post data ?????????
  const postData = {
    postInfo: {
      id: id,
      title: title,
      content: content,
      createdAt: createdAt,
      star: star,
      memberInfo: {
        nickname: nickname,
        profileImg: profileUrl,
      },
    },
    comments: comments,
    isLikesCheck: isLikesCheck,
  };

  // ?????? ????????????
  const clicked = new Array(5).fill(true, 0, star);

  // ?????? ?????? ??? 5???(?????? array)
  const array: Array<number> = [0, 1, 2, 3, 4];

  // post ?????? ???/??? ?????? ??? ?????? ??????
  const handleEdit = () => {
    setIsEdit(true);
  };

  // popover post ??????
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEL(e.currentTarget);
  };

  // popover post ?????? ??????
  const handleClose = () => {
    setAnchorEL(null);
  };

  const handleDelete = () => {
    setDeleteClicked(!deleteClicked);
    deleteP();

    setTimeout(() => {
      onClickToggleModal();
    }, 100);
  };

  /**
   * post??? ?????? ?????? ??? ???????????? ???????????? ??????
   * TODO :?????? ?????? ?????? ?????? ??????
   */
  const handleMatPlace = () => {
    navigate(`/places/${placeId}`);
  };

  // popover styling
  const PopoverStyle = {
    zIndex: 10000,
    top: "10px",
  };
  // popover styling
  const PopoverTStyle = {
    backgroundColor: "#e9e9e9",
    fontSize: "15px",
  };
  // popover styling
  const PopoverBtnStyle = {
    backgroundColor: "#874356",
    color: "#ffffff",
    border: "none",
    marginLeft: "5px",
    borderRadius: "30px",
    cursor: "pointer",
    width: "40px",
    height: "20px",
  };

  // '??????' ????????? ?????? ??? like / default ????????? ??????
  const handleLike = () => {
    if (!isLikesCheck) {
      likeP();
      setIsLikesCheck(true);
    } else {
      dislikeP();
      setIsLikesCheck(false);
    }
  };

  // comment list ???????????? ?????? ??? true
  const getAllCommentsReload = () => {
    setCommentReload(true);
  };

  return (
    <StyledModal>
      <span
        role="presentation"
        onClick={onClickToggleModal}
        className="close-btn"
      >
        &times;
      </span>
      {isEdit ? (
        <MatPostUpdate
          id={id}
          onClickToggleModal={onClickToggleModal}
          state={postData}
          placeId={placeId}
        />
      ) : (
        <StyledDiv>
          <StyledContentWrapper>
            <div className="post_title">{title}</div>
            <StyledMid>
              <StyledInfo>
                <ImgContainer>
                  <img src={profileUrl} alt="profileImg" />
                </ImgContainer>
                <div className="post_nickname">{nickname}</div>
                <div className="post_createdAt">
                  {moment(createdAt, "YYYY-MM-DDTHH:mm:ss").format(
                    "YYYY??? MMM Do"
                  )}
                </div>
              </StyledInfo>
              <div>
                <button
                  onClick={handleEdit}
                  className={
                    nickname !== userInfo.nickname &&
                    profileUrl !== userInfo.profileUrl
                      ? "disabled"
                      : ""
                  }
                >
                  ??????
                </button>
                <button
                  onClick={handleClick}
                  className={
                    nickname !== userInfo.nickname &&
                    profileUrl !== userInfo.profileUrl
                      ? "disabled"
                      : ""
                  }
                >
                  ??????
                </button>
                <Popover
                  open={Boolean(anchorEL)}
                  onClose={handleClose}
                  anchorEl={anchorEL}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  style={PopoverStyle}
                >
                  <Typography variant="body2" p={3} style={PopoverTStyle}>
                    ?????? ?????????????????????????
                    <button style={PopoverBtnStyle} onClick={handleDelete}>
                      Yes
                    </button>
                    <button style={PopoverBtnStyle} onClick={handleClose}>
                      No
                    </button>
                  </Typography>
                </Popover>
                <button onClick={handleMatPlace}>?????????????????? ??????</button>
              </div>
            </StyledMid>
            <StyledContent>
              <div dangerouslySetInnerHTML={{ __html: content }}></div>
            </StyledContent>
            <StyledStarsWrapper>
              <StyledStar>
                {array.map((el, idx) => {
                  return (
                    <StarRate
                      key={idx}
                      size="50"
                      className={clicked[el] ? "yellow" : ""}
                    />
                  );
                })}
              </StyledStar>
              <div
                className="post_like"
                onClick={handleLike}
                role="presentation"
              >
                {isLikesCheck ? (
                  <FavoriteIconStyled />
                ) : (
                  <FavoriteBorderIconStyled />
                )}
              </div>
            </StyledStarsWrapper>
          </StyledContentWrapper>
          <MatCommentList
            comments={comments}
            placeId={placeId}
            postId={id}
            getAllCommentsReload={getAllCommentsReload}
          />
        </StyledDiv>
      )}
    </StyledModal>
  );
};

export default PostReadModal;
