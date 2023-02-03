package com.matp.post.service;


import com.matp.comment.dto.MultiResponseDto;
import com.matp.comment.service.CommentService;
import com.matp.exception.CustomErrorCode;
import com.matp.exception.CustomException;
import com.matp.post.dto.*;
import com.matp.post.dto.PostMemberInfo;
import com.matp.post.entity.Post;
import com.matp.post.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostService {
    private final CommentService commentService;
    private final PostRepository postRepository;

    /**
     * @return Flux<PostResponse>
     * @apiNote Post 를 {@link PostRepository} 에서 페이지네이션 해오는 메서드
     * @author 임준건
     */
    @Transactional(readOnly = true)
    public Flux<PostResponse> getAll(int page, int size) {

        Flux<PostResponse> map = postRepository.findPostOrderByDeSc()
                .skip(page * size)
                .take(size)
                .map(PostResponse::from);

        return map;
    }

    /**
     * @return Mono < PostResponse >
     * @apiNote 하나의 Post 를 {@link PostRepository} 에서 찾아오는 메서드
     * @author 임준건
     */
    @Transactional(readOnly = true)
    public Mono<MultiResponseDto> getPost(Long postId, Long memberId) {
        // TODO Member 토큰 에서 memberID 뽑아서 넘겨줘야함 .
        //  좋아요 post 조회시에 체킹유무까지 넘겨줘야함
        return postRepository.findPostWithMemberInfo(postId)
                .publishOn(Schedulers.boundedElastic())
                .map(result -> {

                    var member = PostMemberInfo.builder()
                            .nickname(result.nickname())
                            .profileUrl(result.profileUrl())
                            .build();

                    var comments = commentService.getComments(postId).block();
                    Integer block = postRepository.findLikeCheck(postId, memberId).block();
                    PostResponseWithInfo postResponseWithInfo = PostResponseWithInfo.builder()
                            .id(result.id())
                            .title(result.title())
                            .content(result.content())
                            .likes(result.likes())
                            .thumbnailUrl(result.thumbnailUrl())
                            .star(result.star())
                            .placeId(result.placeId())
                            .createdAt(result.createdAt())
                            .modifiedAt(result.modifiedAt())
                            .commentCount(result.commentCount())
                            .memberInfo(member)
                            .build();

                    return new MultiResponseDto(postResponseWithInfo, comments, block);
                });
    }

    /**
     * @return Flux < PostResponse >
     * @apiNote title keyword 로 Post 를 {@link PostRepository} 에서 찾아오는 메서드
     * @author 임준건
     */
    @Transactional(readOnly = true)
    public Flux<PostResponse> findPostByTitleKeyword(String keyword,int page, int size) {

        return postRepository.searchPostByTitleKeyword(keyword)
                .skip(page * size)
                .take(size)
                .map(PostResponse::from);
    }

    /**
     * @return Flux < PostResponse >
     * @apiNote content keyword 로 Post 를 {@link PostRepository} 에서 찾아오는 메서드
     * @author 임준건
     */
    @Transactional(readOnly = true)
    public Flux<PostResponse> findPostByContentKeyword(String keyword, int page, int size) {

        return postRepository.searchPostByContentKeyword(keyword)
                .skip(page * size)
                .take(size).map(PostResponse::from);
    }

    /**
     * @return Mono < PostResponse >
     * @apiNote PostRequest 를 {@link PostRepository} 에 저장하는 메서드
     * @author 임준건
     */
    @Transactional
    public Mono<PostResponse> save(PostRequest request, Long placeId, Long memberId) {

        Post Post = request.toEntity();
        //TODO memberID 넣어야함
        Post.setMemberId(memberId);
        Post.setPlaceId(placeId);
        Mono<Post> save = postRepository.save(Post);

        return save.map(PostResponse::from);
    }

    /**
     * @return Mono < PostResponse >
     * @apiNote PatchPostRequest 를 {@link PostRepository} 에 저장하는 메서드
     * @author 임준건
     */
    @Transactional
    public Mono<PostResponse> update(PatchPostRequest updatePostRequest, Long postId, Long memberId) {
        Post updatePost = updatePostRequest.toEntity();
        updatePost.setMemberId(memberId);
        return postRepository.findById(postId)
                .flatMap(post -> {
                    if (!Objects.equals(post.getMemberId(), memberId)) {
                        return Mono.error(new CustomException(CustomErrorCode.NOT_ALLOWED_MEMBER_ID));
                    }
                    return postRepository.save(post.settingPost(post, updatePost));
                })
                .map(PostResponse::from);
    }

    /**
     * @return Mono < Void >
     * @apiNote 특정 Post 를 {@link PostRepository} 에서 삭제하는 메서드
     * @author 임준건
     */
    @Transactional
    public Mono<Void> delete(Long postId, Long memberId) {


        return postRepository.findById(postId)
                .map(post -> {
                    if (!Objects.equals(post.getMemberId(), memberId)) {
                        throw new CustomException(CustomErrorCode.NOT_ALLOWED_MEMBER_ID);
                    }
                    return post;
                })
                .flatMap(postRepository::delete)
                .switchIfEmpty(postRepository.PostDeleteWithCommentsLikes(postId));
    }

    /**
     * @return Mono < List < Post > >
     * @apiNote Place 조회시 Post의 평점만 가져오는 메서드
     * @author 이종희
     */
    @Transactional(readOnly = true)
    public Mono<List<Post>> findPlacePosts(Long placeId) {
        return postRepository.findPlacePosts(placeId).collectList();
    }

    /**
     * @return Mono < List < PlaceDetailPostDto > >
     * @apiNote Place 조회시 Post의 id, 평점, 좋아요수, 썸네일 이미지를 매핑하는 메서드
     * @author 이종희
     */
    @Transactional(readOnly = true)
    public Mono<List<PlaceDetailPostDto>> findPlaceDetailPosts(Long placeId) {
        return postRepository.findPlaceDetailPosts(placeId).map(PlaceDetailPostDto::of).collectList();
    }
}