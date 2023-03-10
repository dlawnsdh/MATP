package com.matp.auth.config;

import com.matp.auth.dto.GoogleOAuth2Response;
import com.matp.auth.dto.KakaoOAuth2Response;
import com.matp.auth.dto.MemberPrincipal;
import com.matp.auth.handler.OAuthSuccessHandler;
import com.matp.auth.jwt.JwtAuthenticationFilter;
import com.matp.auth.jwt.JwtTokenProvider;
import com.matp.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;


@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebFluxSecurity
public class SecurityConfig {
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * ????????????(webflux)????????? ServerHttpSecurity??????
     * OAuth2 ???????????? ????????? ??????????????? ????????? ????????????
     * ??? ???????????? ?????????????????? addfilterAt?????? HTTP_BASIC??? ?????????
     */
    @Bean
    public SecurityWebFilterChain configure(ServerHttpSecurity http) throws Exception {
        return http
                .csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .cors().disable()
                .authorizeExchange(auth -> auth
                        .pathMatchers(HttpMethod.GET,"/**").permitAll()
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .anyExchange().authenticated()
                )
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance()) // stateless
                .oauth2Login(oauth -> oauth.authenticationSuccessHandler(new OAuthSuccessHandler(jwtTokenProvider)))
                .exceptionHandling(exceptionHandlingSpec -> exceptionHandlingSpec.accessDeniedHandler((exchange, exception) -> Mono.error(new RuntimeException("?????? ?????? ??????"))))
                .addFilterAt(new JwtAuthenticationFilter(jwtTokenProvider), SecurityWebFiltersOrder.HTTP_BASIC)
                .build();
    }

    /**
     * ReactiveOAuth2UserService??? ???????????? ???????????? ????????? ?????? ????????? ????????? MemberPrincipal??? ???????????? ????????????
     * ?????? ???????????? OidcUser??? ??????
     * ????????????????????? ?????? ????????? ?????????????????? ????????? ??????
     */
    @Bean
    public ReactiveOAuth2UserService<OidcUserRequest, OidcUser> oidcOAuth2UserService(MemberService memberService) {
        final OidcReactiveOAuth2UserService delegate = new OidcReactiveOAuth2UserService();

        return userRequest -> {
            Mono<OidcUser> oidcUser = delegate.loadUser(userRequest);
            String registrationId = userRequest.getClientRegistration().getRegistrationId();

            return oidcUser
                    .map(OAuth2AuthenticatedPrincipal::getAttributes)
                    .map(GoogleOAuth2Response::from)
                    .map(GoogleOAuth2Response::toPrincipal)
                    .flatMap(principal -> {
                        return memberService.findMember(principal.email())
                                .switchIfEmpty(memberService.saveMember(principal.toDto(registrationId)))
                                .map(MemberPrincipal::from);
                    });
        };
    }


    /**
     * ReactiveOAuth2UserService??? ???????????? ???????????? ????????? ?????? ????????? ????????? MemberPrincipal??? ???????????? ????????????
     * ????????? ???????????? OAuth2User??? ??????
     * ????????????????????? ?????? ????????? ?????????????????? ????????? ??????
     */
    @Bean
    public ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService(MemberService memberService) {
        final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();

        return userRequest -> {
            Mono<OAuth2User> oAuth2User = delegate.loadUser(userRequest);
            String registrationId = userRequest.getClientRegistration().getRegistrationId();

            return oAuth2User
                    .map(OAuth2AuthenticatedPrincipal::getAttributes)
                    .map(KakaoOAuth2Response::from)
                    .map(KakaoOAuth2Response::toPrincipal)
                    .flatMap(principal -> {
                        return memberService.findMember(principal.email())
                                .switchIfEmpty(memberService.saveMember(principal.toDto(registrationId)))
                                .map(MemberPrincipal::from);
                    });
        };
    }

}
