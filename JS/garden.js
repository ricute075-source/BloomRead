import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

const actionLoader = document.createElement('div');
actionLoader.id = 'action-loader';
actionLoader.innerHTML = '<div class="action-spinner"></div>';
document.body.appendChild(actionLoader);

window.showActionLoader = () => { document.getElementById('action-loader').style.display = 'flex'; };
window.hideActionLoader = () => { document.getElementById('action-loader').style.display = 'none'; };

const levelUpAudio = new Audio('Audio/chill.mp3');
levelUpAudio.volume = 0.5;

const DIALOGUES = {
    thanh: {
        default: [
            "Waby wabo! Cậu có thấy cái chảo của tớ đâu không?", "Baaaaaaaow! Cây khát nước rồi, hoặc có thể nó thèm bánh mì thịt!",
            "Tớ vừa ăn một quyển sách... à nhầm, đọc một cái bánh Taco!", "Raaaawr! Gieo hạt đi, tớ đang giữ khu vườn an toàn khỏi bọn thây ma vô hình!",
            "Hôm nay trời đẹp để đội chảo lên đầu ra vườn đọc sách đấy!", "Cậu có phân bón không? Tớ định dùng nó làm sốt cà chua!",
            "Rooby rooby roo! Đọc xong trang này cậu mua cho tớ cái Taco nhé?", "Tại sao tớ lại đứng đây? BỞI VÌ TỚ ĐIÊN RỒOOOO!",
            "Cây của cậu đang lớn, giống như cách tóc tớ mọc trong cái chảo này vậy!", "Tưới nước cho nó đi, đừng tưới lên đầu tớ!",
            "Focus Mode à? Có bằng chế độ Taco-Mode của tớ không?", "Này! Có con kiến đang tính ăn trộm kiến thức của cậu kìa!",
            "Sách hay đấy! Có đoạn nào dạy làm sốt Mayonnaise không?", "Grraargh! Thu hoạch hoa nhanh lên trước khi tớ ăn mất nó!",
            "Tớ bán mọi thứ từ xe cũ đến phân bón... nhưng kiến thức thì cậu phải tự cày!", "Bluh bluh bluh! Đọc sách nhiều vào, não to ra thì đội chảo mới chật!",
            "Cây đang lớn! Cây đang lớn! Giống như cái bụng của tớ sau khi ăn phở!", "Một ngày không đọc sách là một ngày không có Taco!",
            "Tớ cá 10 cái chảo là cây này nở ra sẽ đẹp lắm đây!", "Xin chào! Tớ là Thành. Nhưng mọi người thường gọi tớ là... CRAZY THÀNH!"
        ],
        b1: [
            "Trời sáng rồi! Mang chảo ra phơi nắng thôi!", "Oa, nắng sớm làm Taco của tớ giòn hơn đấy!",
            "Cây đang tập thể dục buổi sáng kìa, Wabo!", "Nắng chiếu lung linh muôn hoa vàng... và cái chảo của tớ!",
            "Bình minh là lúc zombie lười nhất, an toàn rồi!", "Mặt trời to quá, trông như một cái bánh Crepe khổng lồ!",
            "Dậy đọc sách thôi! Chim đang hót 'Waby Wabo' kìa!", "Nắng làm tớ hắt xì! Át chù! Rớt luôn cái chảo!",
            "Cậu có thấy giọt sương không? Tớ vừa nếm thử, vị lạt nhách!", "Buổi sáng ở đây trong lành quá, tớ muốn ăn sáng 3 lần!",
            "Hoa hướng dương thích nắng, tớ thì thích ngủ nướng... khò khò.", "Dậy sớm để thành công! Hoặc để ăn được nhiều Taco hơn!",
            "Ánh sáng ban mai làm nụ hoa nở nhanh hơn đó!", "Tớ định nấu trứng ốp la bằng ánh nắng này, chảo sẵn sàng rồi!",
            "Trời xanh, mây trắng, nắng vàng, và tớ... điên rồ!", "Đọc sách buổi sáng giúp não cậu to như cái chậu này vậy!",
            "Wabo! Gió mát quá, thổi bay mất cả suy nghĩ của tớ rồi!", "Tưới nước buổi sáng là chuẩn bài nhất đấy!",
            "Mặt trời chào cậu kìa, chào lại đi: Baaaaow!", "Không khí này làm tớ muốn múa điệu Zombie vỡ lòng!"
        ],
        b2: [
            "Tối thui! Cậu có mang theo đuốc không?", "Suỵt! Đêm nay tớ nghe thấy tiếng sột soạt... chắc là zombie!",
            "Khu rừng này rùng rợn quá, tớ trốn vào chảo đây!", "Cây có ngủ không nhỉ? Hay nó thức để đọc sách cùng cậu?",
            "Wabo... đom đóm bay quanh chậu kìa, tớ tưởng là đạn súng la-de!", "Trăng sáng quá, giống hệt một chiếc đĩa ném!",
            "Đêm huyền bí, tớ định nấu súp bí ẩn bằng phân bón và nước mương!", "Đừng đọc truyện ma ở đây nhé, tớ sợ tè ra quần mất!",
            "Cây ban đêm thở ra CO2, tớ thở ra tiếng ngáy khò khò...", "Bóng tối thế này thì bọn thây ma sẽ không thấy tớ đâu!",
            "Rừng đêm yên tĩnh quá, tớ phải hét lên cho vui: WABO!", "Ngôi sao trên kia có rơi xuống thành hạt giống không nhỉ?",
            "Lạnh quá! Cho tớ mượn áo khoác, hoặc cái lò sưởi đi!", "Ban đêm thì hoa nở kiểu gì? Nở lén à?",
            "Nếu có ma, tớ sẽ dùng chảo đập nó một trận!", "Chậu cây ban đêm trông như cái hũ vàng phát sáng!",
            "Tớ vừa thấy một cái bóng! Ồ, là bóng của tớ.", "Thức khuya hại sức khỏe, nhưng vì cậu nên tớ sẽ thức gác vườn!",
            "Gió rít ghê quá! Raaaawr! Tớ rít lại luôn cho sợ!", "Khò... khò... tớ đang gác... khò..."
        ],
        b3: [
            "Oaaaa! Chó bự kìa! Tớ cỡi lên lưng nó được không?", "Bé sói này có thích ăn thịt nướng không nhỉ?",
            "Nó đang nhìn tớ kìa... Đừng cắn chảo của tớ nhé!", "Wabo! Tớ và sói sẽ hợp tác bảo vệ khu vườn!",
            "Con sói này ngầu quá, tớ vuốt lông nó nhé? AAAA nó gầm!", "Này Sói, mày có biết sủa 'Waby wabo' không?",
            "Sói và Crazy Thành! Cặp bài trùng vô địch vũ trụ!", "Mắt nó đỏ kìa, tớ lấy kính râm đeo cho nó nha?",
            "Nó thở ra khói hay tớ đang hoa mắt thế?", "Tớ cá là bé sói này cũng thích đọc tiểu thuyết ngôn tình!",
            "Gâu! Gâu! Tớ đang giao tiếp với nó bằng tiếng Sói!", "Con sói này bảo vệ vườn tốt hơn chảo của tớ đấy!",
            "Đừng để sói đói nhé, không nó ăn mất cây của cậu đấy!", "Nếu zombie tới, tớ sẽ chỉ tay bảo: 'Sói, cắn nó!'",
            "Bộ lông này mượt thật, làm chăn đắp mùa đông thì tuyệt!", "Sói ơi! Đi mua giùm anh cái bánh mì Taco!",
            "Cậu chủ của con sói này chắc phải ngầu lắm!", "Tớ đang dạy sói tưới cây, nhưng nó lại đi vệ sinh vào chậu...",
            "Nó cứ chằm chằm vào cái chảo của tớ. Không ăn được đâu!", "Sói cô độc gặp Thành điên rồ... hết cô độc luôn!"
        ]
    },
    quan: {
        default: [
            "Thật thảm hại. Ngươi nghĩ vài trang sách có thể đọ lại bộ óc vĩ đại của ta sao?", "Cái cây xơ xác của ngươi làm ta chướng mắt. Tưới nước đi!",
            "Ta đã tính toán được tỷ lệ héo úa... 100% nếu ngươi lười biếng!", "Ngươi gọi đây là 'vườn' sao? Ta gọi đây là 'phòng thí nghiệm thất bại'.",
            "Bón phân đi. Dù nó không giúp IQ của ngươi tăng lên.", "Ta, Tiến sĩ Minh Quân vĩ đại, đang phí phạm thời gian nhìn ngươi trồng trọt.",
            "Trí thông minh của ngươi bằng đúng số lá trên cái cây này. Tròn trĩnh số 0.", "Cố gắng đọc sách đi, để thu hẹp khoảng cách vô cực giữa ta và ngươi.",
            "Ngươi định để nó chết khát sao? Một chiến lược thật tồi tệ.", "Cái chậu của ngươi thiếu tính logic. Thật nhàm chán.",
            "BloomRead? Ta có thể lập trình ra ứng dụng này trong lúc nhắm mắt.", "Tưới quá tay rồi kìa! Não ngươi không chứa nổi khái niệm 'vừa đủ' sao?",
            "Thu hoạch hoa đi, để ta xem thành quả thảm hại của ngươi.", "Sách của ngươi toàn kiến thức tầm thường.",
            "Khu vườn này đang làm ô nhiễm tầm nhìn vĩ đại của ta.", "Cây cần H2O. Đó là Nước đấy, giải thích cho kẻ kém cỏi hiểu.",
            "Tên Crazy Thành là đồ ngốc, ngươi còn tệ hơn khi để cây héo.", "Bón phân vào! Thuật toán nói nó đang thiếu Nitơ trầm trọng.",
            "Chỉ kẻ não phẳng mới không biết dùng Focus Mode.", "Ghi nhớ tên ta: Tiến Sĩ Minh Quân! Kẻ thống trị khu vườn này."
        ],
        b1: [
            "Ánh sáng ban mai hoàn hảo. Phổ quang phổ ở mức tối ưu để quang hợp.", "UV index đang tăng. Ngươi có định che chắn cho thí nghiệm không?",
            "Nhiệt độ buổi sáng phù hợp để các enzym trong lá hoạt động.", "Khu vườn ban mai à? Một cái tên sến súa thiếu tính khoa học.",
            "Ánh sáng chói lóa này đang cản trở tầm nhìn màn hình vi tính của ta.", "Ta đã thức trắng đêm để làm việc, và ánh mặt trời này thật chướng mắt.",
            "Sự ngưng tụ của nước trên lá - hiện tượng vật lý cơ bản, không có gì lạ.", "Nhanh lên, tận dụng tối đa chu trình Calvin khi còn có ánh sáng.",
            "Tiếng chim ồn ào. Ta nên chế tạo một cỗ máy tạo sóng siêu âm để đuổi chúng.", "Bình minh chỉ là ảo ảnh quang học do sự tự quay của Trái Đất.",
            "Quang hợp đang diễn ra với tốc độ 2.3 micromol CO2 mỗi giây.", "Ngươi đứng ngây ra đó ngắm cảnh à? Trí tuệ không tự sinh ra đâu!",
            "Ánh nắng làm lộ rõ sự yếu ớt của cái cây thí nghiệm này.", "Ta không cần phơi nắng. Bức xạ mặt trời có hại cho tế bào da thiên tài.",
            "Đừng để đất bốc hơi hết H2O. Sự bốc thoát hơi nước đang tăng cao.", "Một buổi sáng hoàn hảo để ta chứng minh định lý mới.",
            "Nắng ấm? Cảm xúc con người thật thừa thãi và phi logic.", "Ta có thể tính được góc chiếu của mặt trời là bao nhiêu độ lúc này.",
            "Không khí trong lành không làm não ngươi thông minh lên được đâu.", "Tiếp tục đọc sách đi, đừng để ánh sáng làm phân tâm bộ não nhỏ bé đó."
        ],
        b2: [
            "Bóng tối. Không có ánh sáng, pha tối của quang hợp sẽ sớm dừng lại.", "Nhiệt độ giảm. Tốc độ chuyển hóa trong thực vật đang chậm đi.",
            "Tại sao ngươi lại chọn không gian phi logic này để trồng cây?", "Bóng tối cản trở việc quan sát số liệu. Ta cần bật đèn pha 10.000 lumen.",
            "Rừng đêm huyền bí? Nghe như một tựa game rẻ tiền thiếu thực tế.", "Những âm thanh này... sinh vật sống về đêm đang hoạt động quanh đây.",
            "Không có quang hợp tự nhiên, ta đề xuất dùng đèn LED phổ nhân tạo.", "Đêm là lúc ta hoạt động hiệu suất 200%. Ngươi thì đang ngáp dài.",
            "Sự sụt giảm lượng ánh sáng ảnh hưởng nghiêm trọng đến chu kỳ sinh học.", "Đừng để nỗi sợ hãi nguyên thủy bóng tối chi phối não bộ ngươi.",
            "Nếu ngươi sợ ma, ta có thể chứng minh chúng không tồn tại bằng toán học.", "Môi trường thiếu sáng. Phân bón lúc này là giải pháp bù đắp duy nhất.",
            "Thực vật đang hô hấp. Nó đang cướp O2 của ta. Đáng giận!", "Bóng đêm này làm ta nhớ đến không gian vô định của vũ trụ... cũng tầm thường.",
            "Sương đêm đang bổ sung một lượng độ ẩm siêu vi cho chất nền.", "Đừng lấy cớ buồn ngủ để trốn tránh việc đọc sách.",
            "Màn đêm đen như tương lai học thuật của ngươi vậy.", "Rừng khuya, nhiệt độ sụt giảm, ngươi nên mặc thêm áo nếu không muốn ốm.",
            "Sự tĩnh lặng này khá tốt để tập trung... nếu ngươi không cứ thở mạnh thế.", "Dữ liệu ban đêm đã được ta thu thập xong. Thí nghiệm tiếp tục."
        ],
        b3: [
            "Một cá thể Canis lupus? Ai cho phép mang dã thú vào phòng thí nghiệm?", "Hệ thống thần kinh của con vật này có vẻ phản ứng bất thường với ta.",
            "Đừng để con sói đó cắn nát mẫu vật thực vật của ta!", "Ta có thể tính toán lực cắn của nó: đủ để nghiền nát xương ngươi đấy.",
            "Bức xạ năng lượng quanh con sói này không hợp lý. Đột biến gen chăng?", "Một con sói cô độc. Bầy đàn là sự yếu đuối, nó hiểu được điều đó.",
            "Mang nó ra xa khỏi ta! Lông chó sói làm giảm độ vô trùng của áo blouse!", "Minh Quyền và con sói này... đều mang một sự phi logic khó chịu.",
            "Ánh mắt của dã thú. Nó đang phân tích điểm yếu của ta ư? Hoang tưởng!", "Ta đang tự hỏi nếu cấy ghép chip vào não con sói này thì sao...",
            "Nó không sủa. Ít ra nó biết giữ im lặng khi thiên tài đang suy nghĩ.", "Sự tồn tại của sinh vật này nằm ngoài phương trình sinh thái thông thường.",
            "Nó đang bảo vệ ngươi sao? Thật nực cười. Một cái máy quét tia laser sẽ tốt hơn.", "Con sói này có vẻ thích cái chậu. Thật thiếu tính thẩm mỹ.",
            "Quan sát sự di chuyển của nó... cơ bắp hoàn hảo, nhưng trí não vẫn là cầm thú.", "Đừng tưởng có sói bảo vệ thì ngươi không cần làm bài tập!",
            "Nếu nó dám gầm vào mặt ta, ta sẽ biến nó thành thí nghiệm tĩnh điện.", "Môi trường có dã thú làm tăng hormone cortisol, giúp ngươi tỉnh táo hơn đấy.",
            "Ta không sợ chó. Ta chỉ không thích sự giao tiếp vô nghĩa với sinh vật bậc thấp.", "Sói của Minh Quyền? Một sản phẩm thiết kế lai tạp sự cường điệu."
        ]
    },
    quyen: {
        default: [
            "...", "Sự tĩnh lặng là một món quà. Đừng phá vỡ nó.", "Ta chuộng bóng tối hơn những lời sáo rỗng.", 
            "Gieo hạt đi. Một mầm sống cô độc bắt đầu.", "Tưới nước. Chăm sóc sự sống không cần phải ồn ào.",
            "Mỗi cuốn sách là một thế giới cô lập. Ta thích chìm vào đó.", "Chậu cây này... đường nét thiết kế khá tạm bợ.",
            "Ngươi ồn ào quá. Tập trung đi.", "Ta không cần ai hiểu. Chỉ cần cây tiếp tục sống.",
            "Hãy để thời gian làm việc của nó. Đừng ép buộc.", "Phân bón... nuôi dưỡng từ những thứ mục nát.",
            "Hoa nở hay tàn, cuối cùng cũng trở về với đất.", "Không cần ánh hào quang. Ta hoạt động tốt nhất trong bóng râm.",
            "Sự sống thật mong manh... giống như những bản nháp thiết kế bị vứt bỏ.", "Hãy đọc trong yên lặng. Trí tuệ sinh ra từ sự cô độc.",
            "Thế giới quá nhiều tạp âm. BloomRead là nơi ta tìm thấy sự phẳng lặng.", "Cây đang lớn. Chậm rãi và không phô trương.",
            "Kẻ mạnh nhất là kẻ chịu đựng được sự cô đơn.", "Đừng hỏi ta tại sao lại đứng đây. Ta thích thế.",
            "Ta là Minh Quyền. Mọi thứ chỉ cần hoàn hảo trong tĩnh lặng."
        ],
        b1: [
            "Ban mai... quá nhiều ánh sáng. Nó làm ta nhức mắt.", "Tiếng ồn của buổi sáng phá hỏng thiết kế tĩnh lặng của ta.",
            "Ánh mặt trời gay gắt. Ta muốn trở về với bóng râm.", "Mọi thứ bị phơi bày dưới ánh sáng này. Không có chỗ cho sự bí ẩn.",
            "Chim hót, gió thổi. Một bản giao hưởng hỗn loạn.", "Ta không thuộc về khung cảnh rực rỡ này.",
            "Che bớt nắng lại. Tác phẩm của ta cần độ tương phản trầm hơn.", "Khung cảnh này quá sặc sỡ. Nó làm lu mờ chủ thể.",
            "Ban mai là sự bắt đầu ồn ào mà ta buộc phải chấp nhận.", "Nắng vàng trên lá xanh. Bố cục màu sắc cơ bản... hơi nhàm chán.",
            "Ta thà vẽ một bầu trời xám xịt còn hơn sự tươi tắn giả tạo này.", "Ánh sáng chói lóa không che giấu được sự thật trống rỗng.",
            "Tưới nước nhanh đi để ta tìm chỗ trú nắng.", "Chậu cây trông thật lạc lõng giữa ánh sáng rực rỡ này.",
            "Bình minh nhắc nhở ta rằng một ngày mệt mỏi lại bắt đầu.", "Ta ghét sự nhiệt tình của buổi sáng.",
            "Đừng bắt ta phải mỉm cười với mặt trời. Không bao giờ.", "Nhiệt độ đang tăng. Cảm giác khó chịu lan tỏa.",
            "Khung cảnh này thiếu đi chiều sâu của bóng tối.", "Hãy để ta yên dưới tán cây này. Khỏi ánh sáng mặt trời."
        ],
        b2: [
            "Rừng đêm... Nơi ta thuộc về.", "Bóng tối bao trùm. Mọi đường nét đều trở nên tinh tế.",
            "Sự tĩnh mịch tuyệt đối. Đây mới là cảm hứng thiết kế của ta.", "Dưới ánh trăng, chậu cây trông như một kiệt tác cô độc.",
            "Bóng đêm giấu đi những khuyết điểm của trần thế.", "Không có tạp âm. Chỉ có tiếng thở của màn đêm.",
            "Màu đen không phải là u ám. Nó là sự bao dung vô tận.", "Ta có thể đứng đây hàng giờ mà không cảm thấy phiền phức.",
            "Rừng khuya lạnh lẽo. Nhưng nó chân thật hơn ban ngày.", "Ánh sáng yếu ớt của cây là điểm nhấn hoàn hảo cho canvas này.",
            "Hãy cứ đọc sách trong tĩnh lặng. Đêm sẽ bảo vệ ngươi.", "Sự huyền bí của bóng tối kích thích tư duy nghệ thuật.",
            "Ta yêu sự đơn sắc của cảnh vật lúc này.", "Khu rừng này chia sẻ sự cô độc cùng ta.",
            "Chỉ những kẻ mạnh mẽ mới dám đối diện với bóng tối.", "Những chiếc lá chìm trong bóng râm... một vẻ đẹp u uất.",
            "Đừng bật đèn. Ngươi sẽ phá hỏng kiệt tác không gian này.", "Gió đêm thổi qua. Ta nghe thấy tiếng gọi của sự hư vô.",
            "Không cần phô trương. Đêm tối tự thân nó đã là quyền lực.", "Chăm sóc cây đi. Đêm nay sẽ dài đấy."
        ],
        b3: [
            "Bạn của ta. Chúng ta thuộc về nhau.", "Con sói này hiểu sự tĩnh lặng tốt hơn bất kỳ con người nào.",
            "Bộ lông trắng, lửa đỏ, bóng đêm. Phối màu hoàn hảo do ta tạo ra.", "Sói cô độc... Ta tìm thấy hình bóng mình trong nó.",
            "Đừng sợ nó. Nó chỉ cắn những kẻ đạo đức giả.", "Sự hiện diện của nó mang lại cho ta cảm giác an toàn câm lặng.",
            "Sói không cần bầy đàn để chứng minh sức mạnh.", "Ngươi thấy ngọn lửa trên lưng nó chứ? Đó là ngọn lửa của sự kiêu hãnh.",
            "Nó đang gác đêm. Ngươi cứ việc đọc sách đi.", "Ánh mắt nó sắc bén, nhìn thấu những điều giả dối.",
            "Đừng vuốt ve nó. Sự tôn trọng bắt đầu từ việc giữ khoảng cách.", "Chậu cây và con sói. Một sự kết hợp dị biệt nhưng hài hòa.",
            "Ta thiết kế ra nó bằng tất cả tâm hồn đơn độc của mình.", "Nghe tiếng thở của nó xem. Nhịp điệu của vùng hoang dã.",
            "Nó không thích sự ồn ào của tên Thành, hay sự ngạo mạn của tên Quân.", "Chỉ cần ta và sói ở đây, không ai có thể làm phiền khu vườn này.",
            "Đừng để nó đói. Dù nó có thể nhịn, nhưng ta không thích.", "Vẻ đẹp của nó là vẻ đẹp của sự nguy hiểm bị kìm nén.",
            "Nó đi bên ta như một cái bóng rực lửa.", "Ngươi có vinh hạnh lớn khi được chiêm ngưỡng tác phẩm sống này đấy."
        ]
    }
};

const DRAMATIC_DEATH_MESSAGES = {
    quan: {
        overwatered: "THẢM HẠI! Tiêu chuẩn 'chăm sóc' của ngươi thật sỉ nhục trí tuệ. Ngươi vừa dìm chết một sinh vật bất động đấy, đồ kém cỏi."
    },
    quyen: {
        overwatered: "Tàn lụi trong sự ngột ngạt. Ngươi đã nhấn chìm hy vọng cuối cùng của nó."
    },
    thanh: {
        overwatered: "Raaaawr! Cây khát NƯỚC! Chứ không cần một cái Taco-Tsunami hương vị ngập úng! Nhìn nó xem, nó sũng nước rồi! Wabo!"
    }
};

const ITEM_DB = {
    's1': { name: 'Hoa hướng dương', img: 'Img/SunFlower/Seed.png', type: 'seed' },
    'p1': { name: 'Chậu Thường', img: 'Img/NormalPot.png', type: 'pot' },
    'p2': { name: 'Chậu Vàng', img: 'Img/GoldenPot.png', type: 'pot' },
    'p3': { name: 'Chậu Của Coder', img: 'Img/CoderPot.png', type: 'pot' },
    'b1': { name: 'Khu vườn ban mai', img: 'Img/KhuVuonBanMai.jpg', type: 'bg' }, 
    'b2': { name: 'Rừng đêm huyền bí', img: 'Img/Rung_Dem_Huyen_Bi.png', type: 'bg' }, 
    'b3': { name: 'Sói của Minh Quyền', img: 'Img/SoiCuaMinhQuyen.png', type: 'bg' }, 
    'w1': { name: 'Bình Nước', img: 'Img/nuoc.png', type: 'tool' },
    'f1': { name: 'Phân Bón', img: 'Img/phanbon.png', type: 'tool' },
    'c1': { name: 'Dr.Minh Quân', img: 'Img/DrMinhQuan.png', type: 'character' },
    'c2': { name: 'Quyền Cô Độc', img: 'Img/MinhQuyen.png', type: 'character' } 
};

function getCharacterQuote(charType, bgImg) {
    let bgKey = 'default';
    if (bgImg === 'Img/KhuVuonBanMai.jpg') bgKey = 'b1';
    else if (bgImg === 'Img/Rung_Dem_Huyen_Bi.png') bgKey = 'b2';
    else if (bgImg === 'Img/SoiCuaMinhQuyen.png') bgKey = 'b3';

    const quotes = DIALOGUES[charType][bgKey] || DIALOGUES[charType]['default'];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function getCurrentCharType() {
    if (userData.equippedChar === 'c1') return 'quan';
    if (userData.equippedChar === 'c2') return 'quyen';
    return 'thanh';
}

function triggerDramaticDeath(cause) {
    const charType = getCurrentCharType();
    const message = DRAMATIC_DEATH_MESSAGES[charType][cause];
    const deathOverlay = document.getElementById('dramatic-death-overlay');
    const deathMessageText = document.getElementById('death-message-text');

    if (deathMessageText) {
        deathMessageText.textContent = message;
    }
    if (deathOverlay) {
        deathOverlay.classList.add('show');
    }
    setTimeout(() => {
        if (deathOverlay) {
            deathOverlay.classList.remove('show');
        }
        updateGardenVisuals();
    }, 5000);
}

let currentUser = null;
let userData = {};
const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
const MAX_WATER = 16;
const MAX_FERTILIZER = 3;

const PLANT_STAGES_CONFIG = {
    'Img/BrokenPot.png': [
        { threshold: 0, img: 'Img/SunFlower/BrokenPot_Seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/BrokenPot_Seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/BrokenPot_Seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/BrokenPot_Seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/BrokenPot_Seed4.png', label: "NỞ HOA" }
    ],
    'Img/NormalPot.png': [
        { threshold: 0, img: 'Img/SunFlower/NormalPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/NormalPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/NormalPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/NormalPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/NormalPot_seed4.png', label: "NỞ HOA" }
    ],
    'Img/GoldenPot.png': [
        { threshold: 0, img: 'Img/SunFlower/GoldenPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/GoldenPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/GoldenPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/GoldenPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/GoldenPot_seed4.png', label: "NỞ HOA" }
    ],
    'Img/CoderPot.png': [
        { threshold: 0, img: 'Img/SunFlower/NormalPot_seed0.png', label: "CÂY MẦM" },
        { threshold: 10, img: 'Img/SunFlower/NormalPot_seed1.png', label: "CÂY NON" },
        { threshold: 30, img: 'Img/SunFlower/NormalPot_seed2.png', label: "TRƯỞNG THÀNH" },
        { threshold: 50, img: 'Img/SunFlower/NormalPot_seed3.png', label: "NỤ HOA" },
        { threshold: 70, img: 'Img/SunFlower/NormalPot_seed4.png', label: "NỞ HOA" }
    ]
};

window.defaultGardenText = "Cậu chọn hạt giống đi nào";

function updateThanhSpeech(msg, type = 'success') {
    const seedHint = document.getElementById('seed-hint');
    if (!seedHint) return;

    seedHint.textContent = msg;

    if (type === 'error') {
        seedHint.style.color = '#ef4444';
        seedHint.style.borderColor = '#ef4444';
    } else if (type === 'warning') {
        seedHint.style.color = '#F59E0B';
        seedHint.style.borderColor = '#F59E0B';
    } else {
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
    }

    if (seedHint.timeoutId) clearTimeout(seedHint.timeoutId);

    seedHint.timeoutId = setTimeout(() => {
        seedHint.textContent = window.defaultGardenText;
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
        seedHint.timeoutId = null;
    }, 4500);
}

window.showConfirm = function (msg) {
    return new Promise((resolve) => {
        let confirmBox = document.getElementById('custom-confirm-garden');
        if (!confirmBox) {
            confirmBox = document.createElement('div');
            confirmBox.id = 'custom-confirm-garden';
            confirmBox.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100000; display: none; justify-content: center; align-items: center; backdrop-filter: blur(4px);";
            confirmBox.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: popIn 0.3s ease;">
                    <div id="confirm-msg-text-garden" style="font-size: 16px; margin-bottom: 25px; color: #333; line-height: 1.5; white-space: pre-wrap; font-family: 'Inter', sans-serif; font-weight: 600;"></div>
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="btn-confirm-no-garden" style="background: #9CA3AF; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Hủy</button>
                        <button id="btn-confirm-yes-garden" style="background: #16A34A; color: white; border: none; padding: 10px 30px; border-radius: 30px; font-weight: bold; font-family: 'Inter', sans-serif; font-size: 14px; cursor: pointer; transition: 0.2s;">Đồng ý</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmBox);
        }
        document.getElementById('confirm-msg-text-garden').textContent = msg;
        confirmBox.style.display = 'flex';

        document.getElementById('btn-confirm-yes-garden').onclick = () => {
            confirmBox.style.display = 'none';
            resolve(true);
        };
        document.getElementById('btn-confirm-no-garden').onclick = () => {
            confirmBox.style.display = 'none';
            resolve(false);
        };
    });
};

function setupCharacter() {
    const mainBg = document.getElementById('main-bg');
    if (!mainBg) return;

    let characterContainer = document.getElementById('thanh-container');
    if (!characterContainer) {
        characterContainer = document.createElement('div');
        characterContainer.id = 'thanh-container';

        const seedHint = document.getElementById('seed-hint');
        if (seedHint) {
            characterContainer.appendChild(seedHint);
        }

        const charImg = document.createElement('img');
        charImg.id = 'crazy-thanh'; 
        charImg.onerror = function () { this.style.display = 'none'; };
        characterContainer.appendChild(charImg);

        mainBg.appendChild(characterContainer);
    }

    const charImg = document.getElementById('crazy-thanh');
    const charType = getCurrentCharType();
    
    if (charType === 'quan') charImg.src = 'Img/DrMinhQuan.png';
    else if (charType === 'quyen') charImg.src = 'Img/MinhQuyen.png';
    else charImg.src = 'Img/crazy_thanh.png';

    charImg.onclick = () => {
        if (userData.plantState !== 'dead' && userData.plantedSeed) {
            const currentBg = userData.equippedBg || 'Img/AnhBackGroundGarden.png';
            const randomQuote = getCharacterQuote(charType, currentBg);
            updateThanhSpeech(randomQuote, "success");
        }
    };
}

function initCareActions() {
    const potWrapper = document.getElementById('pot-wrapper');
    if (!document.getElementById('care-actions')) {
        const careDiv = document.createElement('div');
        careDiv.id = 'care-actions';
        careDiv.className = 'care-actions';
        careDiv.innerHTML = `
            <button id="btn-water" class="btn-care"><img src="Img/nuoc.png"></button>
            <button id="btn-fertilize" class="btn-care"><img src="Img/phanbon.png"></button>
        `;
        potWrapper.appendChild(careDiv);

        document.getElementById('btn-water').onclick = async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            careDiv.classList.remove('show');
            const charType = getCurrentCharType();

            if (!userData.inventory['w1'] || userData.inventory['w1'] <= 0) {
                const isConfirm = await window.showConfirm("Cậu hết Nước mất rồi có muốn ghé Cửa Hàng mua thêm không");
                if (isConfirm) window.location.href = 'shop.html';
                return;
            }

            if (userData.plantState === 'dead') {
                let msg = charType === 'quan' ? "Ngu ngốc! Ngươi đã dìm chết nó rồi. Nhổ đi!" : 
                         (charType === 'quyen' ? "Tàn lụi rồi... Vòng lặp của tự nhiên." : "Waaaa! Cây chết úng rồi cậu nhổ lên trồng lại đi!");
                updateThanhSpeech(msg, "error");
                return;
            }
            const todayStr = new Date().toLocaleDateString('vi-VN');
            const now = Date.now();

            if (userData.plantState === 'overwatered') {
                if (now - userData.overwateredTime <= FORTY_EIGHT_HOURS) {
                    userData.plantState = 'dead';
                    userData.inventory['w1'] -= 1;
                    if (userData.inventory['w1'] <= 0) delete userData.inventory['w1'];

                    triggerDramaticDeath('overwatered');

                    updateGardenVisuals();
                    renderInventoryUI();
                    
                    let msg = charType === 'quan' ? "Cây đã thối rữa vì ngươi tưới quá tay! Nhổ bỏ đi!" : 
                             (charType === 'quyen' ? "Sự sống đã chìm nghỉm trong sai lầm của ngươi." : "Wabo... Cây đã chết úng vì tưới quá tay rồi!");
                    updateThanhSpeech(msg, "error");
                    
                    updateDoc(doc(db, "users", currentUser.uid), {
                        plantState: 'dead', inventory: userData.inventory
                    }).catch(e => console.error(e));

                    return;
                } else {
                    userData.plantState = 'normal';
                    userData.waterCountToday = 0;
                }
            }

            if (userData.lastWaterDateStr !== todayStr) {
                userData.waterCountToday = 0;
                userData.lastWaterDateStr = todayStr;
            }

            userData.waterCountToday += 1;
            userData.inventory['w1'] -= 1;
            if (userData.inventory['w1'] <= 0) delete userData.inventory['w1'];
            userData.lastWatered = now;

            if (userData.waterCountToday > 4) {
                userData.plantState = 'overwatered';
                userData.overwateredTime = now;

                updateGardenVisuals();
                renderInventoryUI();
                
                let msg = charType === 'quan' ? "Dừng lại đồ phá hoại! Ngươi tính biến chậu cây thành bể bơi à?" : 
                         (charType === 'quyen' ? "Nó đang chới với trong nước... giống như một kẻ lạc lõng." : "Waby wabo! Dừng lại! Cây sắp bơi trong chậu luôn rồi kìa!");
                updateThanhSpeech(msg, "error");

                updateDoc(doc(db, "users", currentUser.uid), {
                    inventory: userData.inventory, lastWatered: now, lastWaterDateStr: todayStr,
                    waterCountToday: userData.waterCountToday, plantState: 'overwatered', overwateredTime: now
                }).catch(e => console.error(e));

            } else {
                updateGardenVisuals();
                renderInventoryUI();
                
                let waterMsg = charType === 'quan' ? "Ngươi tưới nước được rồi đấy. Tiếp tục phát huy đi." : 
                               (charType === 'quyen' ? "Tưới nước đi... đừng để sự tĩnh lặng này biến thành cái chết." : "Waby wabo! Cảm ơn cậu đã tưới nước, cây trông tươi tắn lắm!");
                updateThanhSpeech(waterMsg, "success");

                updateDoc(doc(db, "users", currentUser.uid), {
                    inventory: userData.inventory, lastWatered: now, lastWaterDateStr: todayStr,
                    waterCountToday: userData.waterCountToday, plantState: 'normal'
                }).catch(e => console.error(e));
            }
        };

        document.getElementById('btn-fertilize').onclick = async (e) => {
            e.stopPropagation();
            if (!currentUser) return;
            careDiv.classList.remove('show');
            const charType = getCurrentCharType();

            if (!userData.phanbon || userData.phanbon <= 0) {
                const isConfirm = await window.showConfirm("Cậu hết Phân bón rồi có muốn tới Thư Viện đọc sách kiếm thêm không");
                if (isConfirm) window.location.href = 'lib.html';
                return;
            }

            if (userData.plantState === 'dead') {
                let msg = charType === 'quan' ? "Cây chết rồi, phân bón không có tác dụng hồi sinh đâu!" : 
                         (charType === 'quyen' ? "Tàn tro không thể sống lại bằng phân bón." : "Waaaa... Cây chết rồi bón phân cũng vô ích thôi.");
                updateThanhSpeech(msg, "error");
                return;
            }

            const todayStr = new Date().toLocaleDateString('vi-VN');
            if (userData.lastFertilizerDateStr === todayStr) {
                let warnMsg = charType === 'quan' ? "Bộ não ngươi bị chậm à? Bón phân 1 ngày 1 lần thôi!" : 
                               (charType === 'quyen' ? "Hấp tấp không mang lại kết quả. Hôm nay đủ rồi." : "Hôm nay cậu đã bón phân rồi mỗi ngày chỉ 1 lần thôi nhé");
                updateThanhSpeech(warnMsg, "warning");
                return;
            }

            if (userData.fertilizerTime) {
                let msg = charType === 'quan' ? "Ngươi không biết cơ chế hấp thụ à? Nó đang quá tải dinh dưỡng rồi đấy!" : 
                         (charType === 'quyen' ? "Cây đang hấp thụ. Đừng làm phiền quá trình của nó." : "Burb! Cây đang tiêu hóa phân bón đợt trước, đợi chút nhé!");
                updateThanhSpeech(msg, "warning");
                return;
            }
            userData.phanbon -= 1;
            userData.fertilizerTime = Date.now();
            userData.lastFertilizerDateStr = todayStr;

            updateGardenVisuals();
            renderInventoryUI();
            
            let fertMsg = charType === 'quan' ? "Đã bón phân. Hãy xem công trình quang hợp vĩ đang diễn ra đi!" : 
                         (charType === 'quyen' ? "Dinh dưỡng hòa vào đất. Sự phát triển diễn ra trong im lặng." : "Đã bón phân! Sao cây không lớn nhỉ?. Ogga bogga!");
            updateThanhSpeech(fertMsg, "success");
            updateDoc(doc(db, "users", currentUser.uid), {
                phanbon: userData.phanbon,
                fertilizerTime: userData.fertilizerTime,
                lastFertilizerDateStr: userData.lastFertilizerDateStr
            }).catch(e => console.error(e));
        };
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const cheatBtn = document.getElementById('cheat-btn');
        if (user.email === "ricute069@gmail.com") {
            if (cheatBtn) {
                cheatBtn.style.display = 'block';
                cheatBtn.onclick = handleCheatGrowth;
            }
        }
        await fetchAndCheckUser();
        setupCharacter(); 
        initCareActions();
    } else {
        currentUser = null;
        const loader = document.getElementById('page-loader');
        if (loader) loader.classList.add('hidden-loader');
        const checkModalInterval = setInterval(() => {
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
                clearInterval(checkModalInterval);
                loginModal.style.display = 'flex';
                const closeBtn = document.querySelector('.close-login-btn');
                if (closeBtn) closeBtn.onclick = () => { if (!currentUser) window.location.href = 'index.html'; };
            }
        }, 100);
    }
});

async function fetchAndCheckUser() {
    const userRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
        userData = docSnap.data();
        if (!userData.inventory) userData.inventory = {};
        if (userData.plantProgress === undefined) userData.plantProgress = 0;
        if (!userData.plantState) userData.plantState = 'normal';
    } else {
        userData = { flowers: 0, seeds: 1, inventory: {}, plantProgress: 0, plantState: 'normal', waterCountToday: 0, phanbon: 0 };
        await setDoc(userRef, userData);
    }

    if (userData.inventory['w1'] > MAX_WATER) userData.inventory['w1'] = MAX_WATER;
    if (userData.phanbon > MAX_FERTILIZER) userData.phanbon = MAX_FERTILIZER;

    updateGardenVisuals();
    renderInventoryUI();
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) loader.classList.add('hidden-loader');
    }, 1000);

    startFertilizerLoop();
    startThanhAutoTalk();
}

function startFertilizerLoop() {
    setInterval(() => {
        if (currentUser && userData && userData.plantedSeed && userData.fertilizerTime && userData.plantState !== 'dead') {
            const timePassed = Date.now() - userData.fertilizerTime;
            const THIRTY_MINUTES = 30 * 60 * 1000;

            if (timePassed >= THIRTY_MINUTES) {
                userData.plantProgress = Math.min((userData.plantProgress || 0) + 10, 100);
                userData.fertilizerTime = null;

                updateGardenVisuals();

                updateDoc(doc(db, "users", currentUser.uid), {
                    plantProgress: userData.plantProgress,
                    fertilizerTime: null
                }).catch(e => console.error(e));
            }
        }
    }, 10000);
}

let lastReminderWasCare = false;

function startThanhAutoTalk() {
    setInterval(() => {
        const seedHint = document.getElementById('seed-hint');
        if (seedHint && seedHint.timeoutId) return;

        if (currentUser && userData) {
            let msg = window.defaultGardenText;
            const charType = getCurrentCharType();

            if (userData.plantedSeed && userData.plantState === 'normal' && userData.plantProgress < 100) {
                const todayStr = new Date().toLocaleDateString('vi-VN');
                let needsWater = !userData.waterCountToday || userData.waterCountToday < 1;
                let needsFertilizer = userData.lastFertilizerDateStr !== todayStr;

                if (needsWater || needsFertilizer) {
                    if (lastReminderWasCare) {
                        msg = charType === 'quan' ? "Bấm vào chậu đi, ta không nhắc lại lần hai đâu!" : 
                             (charType === 'quyen' ? "Chăm sóc nó đi. Đừng để ta phải lên tiếng." : "Hãy thử bấm vào chậu đi Wabo!");
                        lastReminderWasCare = false;
                    } else {
                        if (needsWater && needsFertilizer) {
                            msg = charType === 'quan' ? "Ngươi định giết cái cây này bằng sự thiếu hụt cả nước lẫn phân bón sao?" : 
                                 (charType === 'quyen' ? "Sự sống đang kiệt quệ dần. Nó cần nước và dinh dưỡng." : "Raawr! Cây khát nước và đói phân bón kìa!");
                        } else if (needsWater) {
                            msg = charType === 'quan' ? "Cây đang thiếu H2O. Tưới nó ngay!" : 
                                 (charType === 'quyen' ? "Đất đang khô cằn. Cho nó một chút sự sống đi." : "Cây đang cần nước đấy cậu tưới cho nó đi!");
                        } else if (needsFertilizer) {
                            msg = charType === 'quan' ? "Kém cỏi. Vào Thư Viện đọc sách kiếm phân bón ngay!" : 
                                 (charType === 'quyen' ? "Tới Thư Viện mang phân bón về. Cây cần nuôi dưỡng." : "Cậu vào Thư Viện kiếm phân bón cho cây mau lớn nhé!");
                        }
                        lastReminderWasCare = true;
                    }
                } else {
                    const currentBg = userData.equippedBg || 'Img/AnhBackGroundGarden.png';
                    msg = getCharacterQuote(charType, currentBg);
                    lastReminderWasCare = false;
                }
            }

            if (seedHint) {
                seedHint.textContent = msg;
                seedHint.style.color = '#16A34A';
                seedHint.style.borderColor = '#16A34A';
            }
        }
    }, 8000);
}

function updateGardenVisuals() {
    const mainBg = document.getElementById('main-bg');
    const centerPot = document.getElementById('center-pot');
    const seedHint = document.getElementById('seed-hint');
    const potWrapper = document.getElementById('pot-wrapper');
    const btnFertilize = document.getElementById('btn-fertilize');
    const charType = getCurrentCharType();

    if (mainBg) {
        mainBg.style.backgroundImage = `url('${userData.equippedBg || 'Img/AnhBackGroundGarden.png'}')`;
        mainBg.style.position = 'relative';
    }

    if (centerPot) centerPot.classList.remove('withered-plant', 'overwatered-plant', 'dead-plant');

    let currentPotImg = userData.equippedPot || 'Img/BrokenPot.png';
    let currentPlantStageImg = currentPotImg;
    let currentLabel = "Cậu chọn hạt giống đi nào";

    if (userData.plantedSeed) {
        if (potWrapper) potWrapper.classList.add('is-planted');

        const todayStr = new Date().toLocaleDateString('vi-VN');
        if (btnFertilize) {
            if (userData.lastFertilizerDateStr === todayStr) {
                btnFertilize.style.display = 'none';
            } else {
                btnFertilize.style.display = 'flex';
            }
        }

        const progress = userData.plantProgress || 0;
        const stages = PLANT_STAGES_CONFIG[currentPotImg] || PLANT_STAGES_CONFIG['Img/BrokenPot.png'];

        let currentStage = stages[0];
        for (let i = 0; i < stages.length; i++) {
            if (progress >= stages[i].threshold) {
                currentStage = stages[i];
            } else { break; }
        }

        currentPlantStageImg = currentStage.img;
        if (userData.plantState === 'dead') {
            if (centerPot) centerPot.classList.add('dead-plant');
            currentLabel = charType === 'quan' ? "Thí nghiệm thất bại. Một cái xác khô." : 
                          (charType === 'quyen' ? "Cái chết là sự giải thoát trong im lặng." : "Cây đã chết úng mất rồi wabo...");
            let potPrefix = 'BrokenPot';
            if (currentPotImg.includes('NormalPot') || currentPotImg.includes('CoderPot')) potPrefix = 'NormalPot';
            if (currentPotImg.includes('GoldenPot')) potPrefix = 'GoldenPot';
            
            currentPlantStageImg = `Img/SunFlower/${potPrefix}_seeddead.png`;
        }
        else if (userData.plantState === 'overwatered') {
            if (Date.now() - userData.overwateredTime > FORTY_EIGHT_HOURS) {
                userData.plantState = 'normal';
                userData.waterCountToday = 0;
            } else {
                if (centerPot) centerPot.classList.add('overwatered-plant');
                currentLabel = charType === 'quan' ? "Cây sắp úng rồi, dừng hành động ngu ngốc lại!" : 
                              (charType === 'quyen' ? "Đừng nhấn chìm nó thêm nữa." : "Wabo! Cây sắp bơi trong chậu rồi dừng tưới đi!");
            }
        }

        if (userData.plantState === 'normal') {
            let isWithered = false;
            if (userData.lastWatered && (Date.now() - userData.lastWatered > FORTY_EIGHT_HOURS)) {
                isWithered = true;
            }

            if (isWithered && progress < 100) {
                if (centerPot) centerPot.classList.add('withered-plant');
                currentLabel = charType === 'quan' ? "Thiếu H2O trầm trọng. Ngươi định để nó chết khát à?" : 
                              (charType === 'quyen' ? "Cây đang khát. Cứu nó trước khi quá muộn." : "Cây đang héo kìa cậu tưới nước đi");
            } else {
                if (progress >= 100) {
                    currentLabel = charType === 'quan' ? "Cũng được đấy. Thu hoạch nhanh đi." : 
                                  (charType === 'quyen' ? "Đến lúc chia tay. Thu hoạch đi." : "Hoa nở rồi cậu thu hoạch đi");
                } else {
                    currentLabel = charType === 'quan' ? "Ta đang giám sát ngươi chăm cây đấy." : 
                                  (charType === 'quyen' ? "Ta vẫn đứng đây, lặng lẽ chờ hoa nở." : "Waby wabo! Nhớ chăm sóc cây mỗi ngày nhé!");
                }
            }
        }

        if (userData.plantState !== 'dead' && userData.lastStageLabel && userData.lastStageLabel !== currentStage.label && progress > 0) {
            levelUpAudio.play().catch(e => console.log(""));
        }
        userData.lastStageLabel = currentStage.label;

    } else {
        if (potWrapper) potWrapper.classList.remove('is-planted');
        currentLabel = charType === 'quan' ? "Thùng rỗng kêu to, chậu không gieo hạt. Gieo đi!" : 
                      (charType === 'quyen' ? "Khoảng trống. Đợi một hạt giống được gieo xuống." : "Cậu chọn hạt giống đi nào");
        userData.lastStageLabel = null;
    }

    if (centerPot) centerPot.src = currentPlantStageImg;
    window.defaultGardenText = currentLabel;

    if (seedHint && !seedHint.timeoutId) {
        seedHint.textContent = currentLabel;
        seedHint.style.color = '#16A34A';
        seedHint.style.borderColor = '#16A34A';
    }
}

async function handleCheatGrowth() {
    userData.inventory['w1'] = Math.min((userData.inventory['w1'] || 0) + 5, MAX_WATER);
    userData.phanbon = Math.min((userData.phanbon || 0) + 2, MAX_FERTILIZER);
    const charType = getCurrentCharType();

    if (userData.plantedSeed && userData.plantState !== 'dead') {
        userData.plantProgress = Math.min((userData.plantProgress || 0) + 50, 100);
        userData.lastFertilizerDateStr = null;

        if (userData.plantState === 'overwatered') {
            userData.plantState = 'normal';
            userData.waterCountToday = 0;
        }
    }

    updateGardenVisuals();
    renderInventoryUI();
    
    let cheatMsg = charType === 'quan' ? "Thao túng thời gian sao? Thú vị đấy, chăm sóc tiếp đi." : 
                  (charType === 'quyen' ? "Bước nhảy vọt phi lý. Nhưng hoa vẫn sẽ nở." : "Tớ vừa dùng cỗ máy thời gian bằng chảo! Cây lại đói rồi!");
    updateThanhSpeech(cheatMsg, "success");

    updateDoc(doc(db, "users", currentUser.uid), {
        inventory: userData.inventory,
        phanbon: userData.phanbon,
        plantProgress: userData.plantProgress || 0,
        plantState: userData.plantState || 'normal',
        lastFertilizerDateStr: null
    }).catch(e => console.error(e));
}

const bagIcon = document.getElementById('bag-icon');
const invWrapper = document.getElementById('inventory-wrapper');
const closeInvBtn = document.getElementById('close-inv-btn');
const potWrapper = document.getElementById('pot-wrapper');

if (bagIcon) {
    bagIcon.onclick = () => {
        if (!currentUser) {
            if (window.showPopup) window.showPopup("Bạn cần đăng nhập để xem túi đồ!");
            return;
        }
        const isOpen = invWrapper.classList.toggle('show');
        bagIcon.src = isOpen ? 'Img/bag_opened.png' : 'Img/bag_closed.png';
        if (isOpen) renderInventoryUI();
    };
}

if (closeInvBtn) {
    closeInvBtn.onclick = () => {
        invWrapper.classList.remove('show');
        bagIcon.src = 'Img/bag_closed.png';
    };
}

if (potWrapper) {
    potWrapper.onclick = async () => {
        if (!currentUser) return;
        const charType = getCurrentCharType();

        if (userData.plantState === 'dead') {
            const isConfirm = await window.showConfirm("Cây đã chết do úng nước. Cậu có muốn nhổ bỏ để trồng cây mới không?");
            if (isConfirm) {
                userData.plantedSeed = null; userData.plantProgress = 0; userData.plantState = 'normal'; userData.waterCountToday = 0; userData.lastFertilizerDateStr = null;
                updateGardenVisuals();
                updateDoc(doc(db, "users", currentUser.uid), {
                    plantedSeed: null, plantProgress: 0, plantState: 'normal', waterCountToday: 0, lastFertilizerDateStr: null
                }).catch(e => console.error(e));
            }
            return;
        }

        if (!userData.plantedSeed) {
            invWrapper.classList.add('show');
            bagIcon.src = 'Img/bag_opened.png';
            window.switchInvTab('inv-seeds', document.querySelector('.inv-tab'));
            renderInventoryUI();
        } else {
            if (userData.plantProgress >= 100 && userData.plantState !== 'dead') {
                const isConfirm = await window.showConfirm("Cậu có muốn thu hoạch bông hoa này để đóng góp cho cộng đồng không?");
                if (isConfirm) {
                    userData.plantedSeed = null; userData.plantProgress = 0; userData.fertilizerTime = null; userData.waterCountToday = 0; userData.lastFertilizerDateStr = null;

                    updateGardenVisuals();
                    renderInventoryUI();
                    
                    let harvestMsg = charType === 'quan' ? "Hừm, cũng thu hoạch được đấy. Tiếp tục làm culi cho ta đi." : 
                                    (charType === 'quyen' ? "Một thành quả nhỏ bé giữa thế giới rộng lớn. Cất nó đi." : "Raaww! Thu hoạch thành công, cám ơn cậu nha!");
                    updateThanhSpeech(harvestMsg, "success");

                    setDoc(doc(db, "server", "stats"), {
                        totalFlowers: increment(1), realFlowers: increment(1)
                    }, { merge: true }).catch(e => console.error(e));

                    updateDoc(doc(db, "users", currentUser.uid), {
                        plantedSeed: null, plantProgress: 0, fertilizerTime: null, waterCountToday: 0, plantState: 'normal', lastFertilizerDateStr: null
                    }).catch(e => {
                        updateThanhSpeech(charType === 'quan' ? "Lỗi kết nối. Kỹ năng của ngươi tệ đến mức làm sập mạng à?" : "Hình như mạng bị zombie cắn đứt rồi, thử lại nhé!", "error");
                    });
                }
            } else if (userData.plantState !== 'dead') {
                const careActions = document.getElementById('care-actions');
                if (careActions) careActions.classList.toggle('show');
            }
        }
    };
}

window.switchInvTab = (tabId, btnElement) => {
    document.querySelectorAll('.inv-pane').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.inv-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
};

window.handleToolClick = async (toolId) => {
    invWrapper.classList.remove('show');
    bagIcon.src = 'Img/bag_closed.png';

    if (toolId === 'w1') {
        const confirm = await window.showConfirm("Cậu có muốn đến Cửa Hàng để mua thêm Nước không?");
        if (confirm) window.location.href = 'shop.html';
    } else if (toolId === 'f1') {
        const confirm = await window.showConfirm("Cậu có muốn đến Thư Viện để đọc sách và nhận thêm Phân bón không?");
        if (confirm) window.location.href = 'lib.html';
    }
};

function renderInventoryUI() {
    const seedContainer = document.getElementById('inv-seeds');
    const potContainer = document.getElementById('inv-pots');
    const bgContainer = document.getElementById('inv-bgs');

    const tabs = document.querySelectorAll('.inv-tab');
    if (tabs.length > 1) tabs[1].textContent = 'KHO';

    let htmlSeeds = '', htmlPots = '', htmlBgs = '';
    if (userData.seeds > 0 && !userData.inventory['s1']) userData.inventory['s1'] = userData.seeds;
    let wCount = Math.min((userData.inventory['w1'] || 0), MAX_WATER);
    htmlPots += `
        <div class="inv-item-card">
            <img src="${ITEM_DB['w1'].img}" class="inv-item-img">
            <div class="inv-item-name">${ITEM_DB['w1'].name}</div>
            <div class="inv-item-qty">Số lượng: ${wCount}/${MAX_WATER}</div>
            <button class="btn-use" onclick="handleToolClick('w1')">CÁCH NHẬN</button>
        </div>
    `;
    let fCount = Math.min((userData.phanbon || 0), MAX_FERTILIZER);
    htmlPots += `
        <div class="inv-item-card">
            <img src="${ITEM_DB['f1'].img}" class="inv-item-img">
            <div class="inv-item-name">${ITEM_DB['f1'].name}</div>
            <div class="inv-item-qty">Số lượng: ${fCount}/${MAX_FERTILIZER}</div>
            <button class="btn-use" onclick="handleToolClick('f1')">CÁCH NHẬN</button>
        </div>
    `;
    
    if (userData.inventory['c1'] > 0 || userData.equippedChar === 'c1') {
        let isCharEquipped = userData.equippedChar === 'c1';
        htmlPots += `
            <div class="inv-item-card">
                <img src="${ITEM_DB['c1'].img}" class="inv-item-img">
                <div class="inv-item-name">${ITEM_DB['c1'].name}</div>
                <div class="inv-item-qty">Sở hữu</div>
                <button class="btn-use ${isCharEquipped ? 'btn-unequip' : ''}" onclick="useItem('c1', 'character', '${isCharEquipped ? 'unequip' : 'c1'}')">
                    ${isCharEquipped ? 'GỠ BỎ' : 'TRANG BỊ'}
                </button>
            </div>
        `;
    }
    if (userData.inventory['c2'] > 0 || userData.equippedChar === 'c2') {
        let isCharEquipped = userData.equippedChar === 'c2';
        htmlPots += `
            <div class="inv-item-card">
                <img src="${ITEM_DB['c2'].img}" class="inv-item-img">
                <div class="inv-item-name">${ITEM_DB['c2'].name}</div>
                <div class="inv-item-qty">Sở hữu</div>
                <button class="btn-use ${isCharEquipped ? 'btn-unequip' : ''}" onclick="useItem('c2', 'character', '${isCharEquipped ? 'unequip' : 'c2'}')">
                    ${isCharEquipped ? 'GỠ BỎ' : 'TRANG BỊ'}
                </button>
            </div>
        `;
    }

    for (const [id, count] of Object.entries(userData.inventory)) {
        if (!ITEM_DB[id] || !count || id === 'w1' || id === 'f1' || id === 'c1' || id === 'c2') continue;
        const item = ITEM_DB[id];

        let isEquipped = (item.type === 'pot' && userData.equippedPot === item.img) ||
            (item.type === 'bg' && userData.equippedBg === item.img);

        let btnAction = isEquipped ? 'unequip' : item.img;
        let btnText = "";
        let btnClass = isEquipped ? 'btn-use btn-unequip' : 'btn-use';
        let isDisabled = false;

        if (item.type === 'seed') {
            if (userData.plantedSeed) {
                btnText = "ĐANG TRỒNG"; isDisabled = true; btnClass = 'btn-use btn-unequip';
            } else { btnText = "GIEO HẠT"; }
        } else {
            btnText = isEquipped ? 'GỠ BỎ' : 'DÙNG';
        }

        const cardHtml = `
            <div class="inv-item-card">
                <img src="${item.img}" class="inv-item-img">
                <div class="inv-item-name">${item.name}</div>
                ${(item.type === 'seed') ? `<div class="inv-item-qty">Số lượng: ${count}</div>` : ''}
                <button class="${btnClass}" ${isDisabled ? 'disabled' : ''} onclick="useItem('${id}', '${item.type}', '${btnAction}')">
                    ${btnText}
                </button>
            </div>
        `;

        if (item.type === 'seed') htmlSeeds += cardHtml;
        else if (item.type === 'pot') htmlPots += cardHtml;
        else if (item.type === 'bg') htmlBgs += cardHtml;
    }

    if (seedContainer) seedContainer.innerHTML = htmlSeeds || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Túi đồ trống cậu ghé Cửa Hàng nhé</p>';
    if (potContainer) potContainer.innerHTML = htmlPots;
    if (bgContainer) bgContainer.innerHTML = htmlBgs || '<p style="grid-column: 1/-1; text-align: center; color: #666;">Chưa có hình nền nào</p>';
}

window.useItem = async (id, type, actionPath) => {
    if (!currentUser) return;
    const charType = getCurrentCharType();

    if (type === 'seed') {
        if (invWrapper) invWrapper.classList.remove('show');
        if (bagIcon) bagIcon.src = 'Img/bag_closed.png';

        let gieoHatMsg = charType === 'quan' ? "Cuối cùng ngươi cũng bắt đầu làm việc. Đừng để nó chết." : 
                        (charType === 'quyen' ? "Một mầm sống cô độc bắt đầu từ đây." : "Waaaby wabo! Đã gieo hạt nhớ tưới nước thường xuyên nhé");
        updateThanhSpeech(gieoHatMsg, 'success');

        userData.plantedSeed = ITEM_DB[id].img;
        userData.seeds -= 1;
        userData.inventory[id] -= 1;
        userData.plantProgress = 0;
        userData.lastWatered = Date.now();
        userData.fertilizerTime = null;
        userData.plantState = 'normal';
        userData.waterCountToday = 0;
        userData.lastFertilizerDateStr = null;

        if (userData.inventory[id] <= 0) delete userData.inventory[id];

        updateGardenVisuals();
        renderInventoryUI();

        updateDoc(doc(db, "users", currentUser.uid), {
            plantedSeed: ITEM_DB[id].img, seeds: userData.seeds, inventory: userData.inventory,
            plantProgress: userData.plantProgress, lastWatered: userData.lastWatered,
            fertilizerTime: null, plantState: 'normal', waterCountToday: 0, lastFertilizerDateStr: null
        }).catch(e => console.error(e));
    }
    else if (type === 'pot') {
        const newPot = actionPath === 'unequip' ? 'Img/BrokenPot.png' : actionPath;
        userData.equippedPot = newPot === 'Img/BrokenPot.png' ? null : newPot;
        updateGardenVisuals();
        renderInventoryUI();
        
        updateDoc(doc(db, "users", currentUser.uid), { equippedPot: newPot === 'Img/BrokenPot.png' ? null : newPot })
            .catch(e => console.error(e));
    }
    else if (type === 'bg') {
        const newBg = actionPath === 'unequip' ? 'Img/AnhBackGroundGarden.png' : actionPath;
        userData.equippedBg = newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg;
        updateGardenVisuals();
        renderInventoryUI();
        
        updateDoc(doc(db, "users", currentUser.uid), { equippedBg: newBg === 'Img/AnhBackGroundGarden.png' ? null : newBg })
            .catch(e => console.error(e));
    }
    else if (type === 'character') {
        const newChar = actionPath === 'unequip' ? null : id;
        userData.equippedChar = newChar;
        setupCharacter(); 
        renderInventoryUI();
        
        updateDoc(doc(db, "users", currentUser.uid), { equippedChar: newChar })
            .catch(e => console.error(e));
    }
};

onSnapshot(doc(db, "server", "stats"), (docSnap) => {
    let celebrateUntil = 0, realFlowers = 0;
    if (docSnap.exists()) {
        celebrateUntil = docSnap.data().celebrateUntil || 0;
        realFlowers = docSnap.data().realFlowers || 0;
    }
    const now = Date.now();
    let overlay = document.getElementById('celebration-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'celebration-overlay';
        overlay.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(22, 163, 74, 0.96); z-index: 100000; justify-content: center; align-items: center; flex-direction: column; color: white; text-align: center; backdrop-filter: blur(8px); animation: fadeIn 0.5s ease;";
        overlay.innerHTML = `
            <h1 style="font-size: 55px; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); padding: 0 20px;">CHIẾN DỊCH THÀNH CÔNG</h1>
            <p style="font-size: 26px; max-width: 900px; line-height: 1.5; padding: 0 20px;">Cộng đồng BloomRead vừa gom đủ 300 đóa hoa ảo. Một phần quà thiện nguyện thực tế mang tên dự án chuẩn bị được gửi đi</p>
            <p style="font-size: 28px; margin-top: 40px; color: #FDE047;">Tổng số hoa thực tế đã quyên góp: <span id="real-flowers-count" style="font-size: 36px; text-decoration: underline;">0</span> bông</p>
            <p style="font-size: 18px; margin-top: 40px; opacity: 0.9; background: rgba(0,0,0,0.2); padding: 10px 20px; border-radius: 50px;" id="celeb-timer">Hệ thống sẽ đếm lại từ đầu sau: 05:00</p>
        `;
        document.body.appendChild(overlay);
    }
    if (celebrateUntil > now) {
        overlay.style.display = 'flex';
        const countSpan = document.getElementById('real-flowers-count');
        if (countSpan) countSpan.textContent = realFlowers;
        if (window.celebInterval) clearInterval(window.celebInterval);
        window.celebInterval = setInterval(() => {
            const timeLeft = celebrateUntil - Date.now();
            if (timeLeft <= 0) {
                clearInterval(window.celebInterval);
                overlay.style.display = 'none';
            } else {
                const m = Math.floor(timeLeft / 60000);
                const s = Math.floor((timeLeft % 60000) / 1000);
                const timerSpan = document.getElementById('celeb-timer');
                if (timerSpan) timerSpan.textContent = `Hệ thống sẽ đếm lại từ đầu sau: 0${m}:${s < 10 ? '0' + s : s}`;
            }
        }, 1000);
    } else {
        if (window.celebInterval) clearInterval(window.celebInterval);
        if (overlay) overlay.style.display = 'none';
    }
});