import styled from "styled-components";
import { IPeopleSearch } from "../api/axiosAPI/search/PeopleSearchAxios";
import { useNavigate } from "react-router";

const UserWrapper = styled.div`
  height: 100%;
  width: 100%;

  .result-box {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    padding-left: 20px;
    border-bottom: 1px solid #ececec;

    &:hover {
      background-color: #efefef;
    }
  }

  .user_thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
  }

  .text-box {
    width: 80%;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }

  .name {
    margin-left: 10px;
    margin-top: 5px;
    font-size: 1.1rem;
    color: #874356;
    &:hover {
      color: #c65d7b;
    }
  }

  .memo {
    margin: 10px 10px 10px 10px;
    font-size: 16px;
    font-weight: 400;
    color: #373737;
  }
`;

const PeopleSearchResult = ({ people }: { people: IPeopleSearch }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/people/${people.id}`);
  };

  return (
    <>
      <UserWrapper onClick={handleClick}>
        <div className="result-box">
          <img src={people.profileUrl} alt="thumbnail" className="user_thumbnail" />
          <div className="text-box">
            <p className="name">{people.nickname}</p>
            {people.memo && <p className="memo">{people.memo}</p>}
          </div>
        </div>
      </UserWrapper>
    </>
  );
};

export default PeopleSearchResult;
