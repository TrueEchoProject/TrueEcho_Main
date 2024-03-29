package te.trueEcho.domain.user.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Repository
public class EmailMemoryRepository {
    private static final Map<String, String> checkCodeMap = new HashMap<>();

    public String findCheckCodeByEmail(String email){ //READ

        log.info("found code = {}", checkCodeMap.get(email));
        return checkCodeMap.get(email);
    }

    @Transactional
    public void saveCheckCode(String email, String checkCode) { // CREATE

        log.info("saved email&code = {}&{}",email,checkCode);
        checkCodeMap.put(email,checkCode);
    }


    @Transactional
    public  void deleteCheckCode(String email){ // DELETE
        checkCodeMap.remove(email);
    }
}
