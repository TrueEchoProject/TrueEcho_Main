package te.trueEcho.domain.friend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import te.trueEcho.domain.friend.service.FriendService;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import te.trueEcho.domain.friend.service.FriendService;

import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
public class FriendControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FriendService friendService;

    @BeforeAll
    public static void setup() {
        Dotenv dotenv = Dotenv.load();
        System.setProperty("ACCESS_TOKEN", dotenv.get("ACCESS_TOKEN"));
        System.setProperty("ACCESS_TOKEN_TIME", dotenv.get("ACCESS_TOKEN_TIME"));
        System.setProperty("REFRESH_TOKEN", dotenv.get("REFRESH_TOKEN"));
        System.setProperty("REFRESH_TOKEN_TIME", dotenv.get("REFRESH_TOKEN_TIME"));
        System.setProperty("DB_HOST", dotenv.get("DB_HOST"));
        System.setProperty("DB_NAME", dotenv.get("DB_NAME"));
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        System.setProperty("DB_PORT", dotenv.get("DB_PORT"));
        System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
        System.setProperty("MAIL_HOST", dotenv.get("MAIL_HOST"));
        System.setProperty("MAIL_PORT", dotenv.get("MAIL_PORT"));
        System.setProperty("MAIL_PW", dotenv.get("MAIL_PW"));
        System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
        System.setProperty("TLS_ENABLE", dotenv.get("TLS_ENABLE"));
    }

    @Test
    public void testAddFriend() throws Exception {
        Long targetUserId = 1L;
        when(friendService.addFriend(targetUserId)).thenReturn(true);

        mockMvc.perform(MockMvcRequestBuilders.post("/friends/add")
                        .param("targetUserId", targetUserId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.code").value("ADD_FRIEND_SUCCESS"));
    }
}