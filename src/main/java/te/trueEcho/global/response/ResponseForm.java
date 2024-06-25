package te.trueEcho.global.response;



import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
@Schema(description = "응답 데이터 폼")
@Getter
public class ResponseForm {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "Http 상태 코드")
   final private int status;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "Business 상태 코드")
    final private String code;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "응답 메세지")
    final private String message;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY,name = "응답 데이터")
    final  private Object data;

    private ResponseForm(ResponseCode resultCode, Object data) {
        this.status = resultCode.getStatus();
        this.code = resultCode.getCode();
        this.message = resultCode.getMessage();
        this.data = data;
    }
  /*
  static ResponseForm of(ResponseCode resultCode, Object data) : HeeJohn
  = 데이터 반환 / 응답 폼에 데이터가 있는 경우
  * @param : responseCode, data
  ! 오버로딩 메소드
  TODO: 작성중.
  last edit: 03.26.24
  */
    public static ResponseForm of(ResponseCode resultCode, Object data) {
        return new ResponseForm(resultCode, data);
    }


    /*
    static ResponseForm of(ResponseCode resultCode) : HeeJohn
    = 응답 코드만 반환 / 응답 폼에 데이터가 없는 경우
    * @param : responseCode
    ! 오버로딩
    TODO: 작성중.
    last edit: 03.26.24
    */
    public static ResponseForm of(ResponseCode resultCode) {
        return new ResponseForm(resultCode, "");
    }
}