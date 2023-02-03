package com.matp.picker.entity;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Table
@Getter
@Builder
public class Picker {
    @Id
    private Long id;

    private Long placeId;

    private Long pickerGroupId;

    private Long memberId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime modifiedAt;

    public static Picker of(Long placeId, Long pickerGroupId, Long memberId) {
        return Picker.builder()
                .placeId(placeId)
                .pickerGroupId(pickerGroupId)
                .memberId(memberId)
                .build();
    }
}
