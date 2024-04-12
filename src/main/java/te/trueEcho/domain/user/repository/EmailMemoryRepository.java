package te.trueEcho.domain.user.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Repository
public class EmailMemoryRepository {
    private static final ConcurrentHashMap<String, String> checkCodeMap = new ConcurrentHashMap<>();

    public String findCheckCodeByEmail(String email){ //READ

        log.info("found code = {}", checkCodeMap.get(email));
        return checkCodeMap.get(email);
    }
    public Boolean checkStatusByEmail(String email){
       return Boolean.valueOf(findCheckCodeByEmail(email));
    }

    @Transactional
    public void saveCheckCode(String email, String checkCode) { // CREATE

        log.info("saved email&code = {}&{}",email,checkCode);
        checkCodeMap.put(email,checkCode);
    }

    @Transactional
    public void verifyEmail(String email){
        saveCheckCode(email,"true");
    }


    @Transactional
    public void deleteEmail(String email){ // DELETE
        checkCodeMap.remove(email);
    }
}
