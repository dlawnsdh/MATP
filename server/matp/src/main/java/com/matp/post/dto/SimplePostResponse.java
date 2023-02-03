package com.matp.post.dto;

import com.matp.post.entity.Post;
import lombok.Builder;

@Builder
public record SimplePostResponse(
        Long id,
        String title,
        String thumbnailUrl,
        Integer likes
) {

}
