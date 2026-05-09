import { doc, getDoc, setDoc, updateDoc, onSnapshot, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { db, auth } from './firebase-config.js';

const levelUpAudio = new Audio('Audio/chill.mp3');
levelUpAudio.volume = 0.5;


const DIALOGUES = {
    thanh: {
        default: [
            "Waby wabo! Cậu có thấy cái chảo của tớ đâu không?", "Baaaaaaaow! Cây khát nước rồi, hoặc thèm bánh mì thịt!",
            "Tớ vừa ăn một quyển sách... à nhầm, đọc một cái bánh Taco!", "Raaaawr! Tớ đang giữ khu vườn an toàn khỏi bọn thây ma vô hình!",
            "Focus Mode à? Có bằng chế độ Taco-Mode của tớ không?", "Này! Có con kiến đang tính ăn trộm kiến thức của cậu kìa!",
            "Cậu tính trồng một cây xúc xích à? Tớ đói rồi!", "Tớ nghe nói thây ma rất sợ hoa hướng dương đấy!",
            "Cái chảo này thu sóng ngoài hành tinh tốt lắm, Wabo!", "Tớ vừa sáng chế ra món Taco kẹp mầm cây... đùa thôi!",
            "Đừng nhìn tớ, nhìn cái cây kìa! Nó đang rướn lên đó!", "Raawwr! Tớ sẵn sàng chiến đấu rồi, mang xẻng ra đây!"
        ],
        bgs: {
            b1: [
                "Trời sáng rồi! Mang chảo ra phơi nắng thôi!", "Oa, nắng sớm làm Taco của tớ giòn hơn đấy!", 
                "Chim đang hót 'Waby Wabo' kìa!", "Nắng lên! Đã đến giờ quang hợp và ăn sáng!",
                "Khu vườn ban mai thơm mùi sương... và mùi chảo chiên!"
            ],
            b2: [
                "Tối thui! Cậu có mang theo đuốc không?", "Suỵt! Đêm nay tớ nghe thấy tiếng sột soạt... chắc là zombie!", 
                "Đom đóm bay quanh chậu kìa!", "Sương mù à? Tớ tàng hình trong sương mù đây!",
                "Cậu rọi đèn pin đi, tớ rọi đường bằng sự điên rồ của mình!"
            ],
            b3: [
                "Oaaaa! Chó bự kìa! Tớ cỡi lên lưng nó được không?", "Bé sói này có thích ăn thịt nướng không nhỉ?", 
                "Wabo! Sói và Thành là số 1!", "Gâu gâu! Mình thi sủa với sói xem ai to hơn nhé!",
                "Hình như sói không thích mùi chảo của tớ cho lắm."
            ],
            b4: [
                "Waa! Chú Quân nóng quá, chảo của tớ sắp chảy rồi!", "Đỏ rực! Không biết có nướng được thịt không nhỉ?", 
                "Ông ấy đang quát mắng cái cây kìa, tớ sợ quá!", "Cứu tớ với, tớ không muốn thành Thành-quay-lu!",
                "Nhiệt độ này ấp trứng gà chắc chắn nở thành phượng hoàng!"
            ]
        },
        pots: {
            p1: [
                "Cái chậu này màu giống hệt bánh nướng!", "Chậu đất nung là số một! Rẻ mà xài tốt!", 
                "Tớ từng đội một cái chậu thế này thay chảo đấy!", "Cậu cẩn thận đừng làm vỡ nó nhé, tớ không có keo dán đâu!", 
                "Đất nung giúp cây dễ thở hơn, giống như tớ mở miệng lúc ngủ vậy!", "Khoét hai lỗ là có cái mặt nạ xịn luôn!"
            ],
            p2: [
                "Wabo! Chậu vàng chói mắt quá!", "Cái chậu này mua được bao nhiêu cái bánh Taco nhỉ?", 
                "Vàng thật hay vàng giả thế? Để tớ cắn thử xem!", "Zombie mà thấy chậu này là nó trộm luôn đấy!", 
                "Chậu xịn thế này trồng hoa chắc thành hoa vàng mất!", "Tớ có nên gõ thử chảo vào chậu xem kêu tiếng gì không?"
            ],
            p3: [
                "Chậu này có phím bấm à? Gõ thử xem nào!", "Tớ thấy dòng code chạy trên chậu kìa! Nó viết gì thế?", 
                "Nếu tớ gõ W-A-B-O thì chậu có nổ không?", "Chậu điện tử này có chống nước không thế? Tưới vào có giật không?", 
                "Wow, chậu của Coder cơ đấy! Chắc nó tự bắt sâu được!", "Nó nháy đèn bíp bíp giống cái lò vi sóng nhà tớ!"
            ]
        },
        combos: {
            b1_p1: ["Nắng sớm chiếu vào chậu đất nung, trông như chiếc bánh nướng khổng lồ!", "Gió mát, chậu đất, sương mai. Hoàn hảo để cắn một miếng Taco!"],
            b1_p2: ["Wabo! Nắng chiếu vào chậu vàng lấp lánh làm tớ chói cả mắt!", "Khu vườn thì xanh, chậu thì vàng, chảo của tớ thì bạc! Tỏa sáng rực rỡ!"],
            b1_p3: ["Đèn LED chậu Coder mờ nhạt trước nắng ban mai, lêu lêu đồ công nghệ!", "Ánh sáng mặt trời sạc pin cho chậu điện tử này đúng không?"],
            b2_p1: ["Trong đêm tối, chậu đất nung chìm nghỉm luôn. Trốn zombie tốt đấy!", "Tối nay lạnh quá, chậu đất có giữ ấm cho cây không?"],
            b2_p2: ["Chậu vàng phát sáng giữa rừng đêm! Wabo, cẩn thận thu hút quái vật!", "Vàng lấp lánh dưới trăng, đẹp như cái chảo của tớ lúc mới mua!"],
            b2_p3: ["Ánh đèn LED của chậu Coder thắp sáng cả khu rừng đêm này!", "Chậu điện tử giữa rừng u ám, trông như đĩa bay UFO vậy!"],
            b3_p1: ["Sói có vẻ thích mùi đất nung của cái chậu này đấy!", "Sói bảo vệ chậu đất, chậu đất nuôi cây, tớ thì ăn Taco!"],
            b3_p2: ["Bé sói đang soi gương qua cái chậu vàng kìa!", "Tớ cá là con sói muốn cắn thử cái chậu vàng này giống tớ."],
            b3_p3: ["Sói đang tò mò với mấy dòng code chạy trên chậu kìa!", "Động vật hoang dã gặp công nghệ cao. Wabo, một sự kết hợp kỳ cục!"],
            b4_p1: ["Lửa giận của bác Quân sẽ nung cái chậu đất này thành gốm sứ cao cấp mất!", "Chậu đất nung chịu nhiệt tốt không? Cứu cái cây với!"],
            b4_p2: ["Chậu vàng cũng chảy thành nước dưới cơn giận này mất! Nóng quá!", "Chậu vàng phản chiếu ngọn lửa đỏ rực, chói mù mắt tớ rồi!"],
            b4_p3: ["Nóng quá hỏng mạch điện tử của chậu Coder bây giờ!", "Bác Quân hét to quá làm chậu báo lỗi 'Error 404' luôn kìa!"]
        }
    },
    quan: {
        default: [
            "Thật thảm hại. Ngươi nghĩ vài trang sách có thể đọ lại bộ óc vĩ đại của ta sao?", "Ta đã tính toán được tỷ lệ héo úa... 100% nếu ngươi lười biếng!",
            "Ngươi gọi đây là 'vườn' sao? Ta gọi đây là 'phòng thí nghiệm thất bại'.", "Ta đang thu thập dữ liệu về sự kém cỏi của ngươi. Rất phong phú!",
            "Phương trình sinh trưởng của cái cây này đang có chiều hướng đi xuống.", "Ngươi không biết phân biệt diệp lục a và diệp lục b à? Kém cỏi!",
            "Mỗi giây ngươi chần chừ là một lượng ATP bị lãng phí.", "Hãy ghi chép lại mọi thay đổi. Khoa học không có chỗ cho sự phỏng đoán!"
        ],
        bgs: {
            b1: [
                "Ánh sáng ban mai hoàn hảo. Phổ quang phổ ở mức tối ưu để quang hợp.", "UV index đang tăng. Ngươi có định che chắn cho thí nghiệm không?",
                "Đây là thời điểm quá trình mở khí khổng diễn ra mạnh nhất. Đừng làm hỏng nó.", "Quang chu kỳ bắt đầu. Bắt tay vào việc đi đồ lười biếng!"
            ],
            b2: [
                "Bóng tối. Không có ánh sáng, pha tối của quang hợp sẽ sớm dừng lại.", "Ta cần bật đèn pha 10.000 lumen. Tối quá!",
                "Sự hô hấp tế bào đang chiếm ưu thế. Môi trường này quá thiếu dữ liệu.", "Rừng đêm nhiều độ ẩm, cẩn thận nấm mốc tiêu diệt mẫu vật."
            ],
            b3: [
                "Một cá thể Canis lupus? Ai cho phép mang dã thú vào phòng thí nghiệm?", "Đừng để con sói đó cắn nát mẫu vật thực vật của ta!",
                "Hệ sinh thái này đang mất cân bằng vì sự xuất hiện của kẻ săn mồi.", "Mùi lông thú làm nhiễu loạn các cảm biến hóa học của ta."
            ],
            b4: [
                "SỰ KÉM CỎI CỦA NGƯƠI ĐÃ VƯỢT QUÁ GIỚI HẠN CHỊU ĐỰNG CỦA TA!", "TẤT CẢ SẼ BỊ THIÊU RỤI BỞI TRÍ TUỆ CỦA TA!", 
                "CÚT ĐI! ĐỪNG LÀM BẨN TẦM NHÌN CỦA TA NỮA!", "SỰ NGU NGỐC CỦA NGƯƠI LÀM TA TĂNG HUYẾT ÁP VÀ ADRENALINE!"
            ]
        },
        pots: {
            p1: [
                "Chậu đất nung rẻ tiền. Không có gì đáng để phân tích.", "Ngươi định ươm mầm sự vĩ đại trong cái bình gốm tầm thường này sao?", 
                "Tính thẩm mỹ là con số không, nhưng tính thực dụng thì tạm chấp nhận.", "Đất nung có độ xốp, giúp thoát nước. Ít ra ngươi không quá ngu ngốc.",
                "Thành phần silicat và alumin trong đất sét này quá kém chất lượng."
            ],
            p2: [
                "Vàng là chất dẫn điện tốt, nhưng làm chậu thì thật phô trương.", "Ngươi tưởng vàng có thể tăng tốc độ quang hợp sao? Ngu xuẩn.", 
                "Kẻ ngốc mới đem kim loại quý đi đựng đất bùn.", "Au - Khối lượng riêng 19.3 g/cm³. Khá nặng đấy, đừng để rớt trúng chân.",
                "Tỷ lệ bức xạ nhiệt của vàng sẽ làm rễ cây bị nướng chín. Chờ mà xem."
            ],
            p3: [
                "Mã code trên chậu này thật sơ sài. Ta có thể viết hay hơn nghìn lần.", "Ta có thể hack cái chậu này trong 3 giây. Nhưng ta không rảnh.", 
                "Cuối cùng cũng có một thiết bị xứng tầm trí tuệ của ta... một chút.", "Hệ thống đèn LED có vẻ đồng bộ. Ai thiết kế nó vậy? Chắc không phải ngươi.",
                "Bảng mạch đang gặp trục trặc do độ ẩm. Công nghệ của các ngươi thật yếu ớt."
            ]
        },
        combos: {
            b1_p1: ["Môi trường tiêu chuẩn, công cụ tiêu chuẩn. Nếu thất bại, lỗi 100% là do năng lực của ngươi.", "Quá trình thoát hơi nước qua chậu đất nung dưới nắng sáng đang ở mức ổn định."],
            b1_p2: ["Ánh phản xạ cực đại. Ta phải đeo kính bảo hộ vì sự kết hợp chói loà và lố bịch này.", "Tia nắng hắt vào vàng. Sự lãng phí vật lý quang học tột cùng."],
            b1_p3: ["Mang hệ thống đèn LED ra phơi nắng? Ngươi không hiểu khái niệm 'thừa thãi' à?", "Cảm biến quang học của chậu đang bị nhiễu do ánh sáng mặt trời mạnh."],
            b2_p1: ["Nhiệt độ giảm. Chậu đất nung không có khả năng giữ nhiệt. Cây sẽ stress lạnh.", "Mọi thứ nguyên thủy đến phát chán. Một thí nghiệm tẻ nhạt trong bóng tối."],
            b2_p2: ["Khoe khoang tài sản giữa rừng khuya? Ngươi không chỉ kém cỏi mà còn thiếu kiến thức sinh tồn.", "Kim loại lạnh nhanh hơn trong đêm. Ngươi đang giết rễ cây đấy."],
            b2_p3: ["Khá khen cho hệ thống đèn LED của chậu Coder đang cung cấp một lượng quang phổ nhỏ giữa đêm.", "Cuối cùng mạch điện tử này cũng có đất dụng võ trong môi trường thiếu sáng."],
            b3_p1: ["Sinh vật hoang dã và vật chứa nguyên thủy. Một phương trình sinh thái cơ bản hoàn chỉnh.", "Hãy xua con sói ra xa, nó sẽ đạp vỡ cái chậu rẻ tiền này mất."],
            b3_p2: ["Cẩn thận! Loài canoid có xu hướng đánh dấu lãnh thổ lên những vật thể nổi bật như chậu vàng này.", "Sự xa hoa vô nghĩa lọt vào tầm ngắm của dã thú."],
            b3_p3: ["Sóng âm từ linh kiện điện tử có thể kích động thính giác của con sói. Tắt đi!", "Một phòng thí nghiệm hỗn loạn: Thú hoang và vi mạch."],
            b4_p1: ["SỨC NÓNG NÀY SẼ NUNG CHÍN CẢ CHẬU ĐẤT LẪN CÁI CÂY TRONG ĐÓ!", "NGƯƠI LÀM TA GIẬN ĐẾN MỨC MUỐN ĐẬP NÁT CÁI CHẬU GỐM NÀY!"],
            b4_p2: ["VÀNG CŨNG PHẢI TAN CHẢY TRƯỚC SỰ PHẪN NỘ VỀ MẶT HỌC THUẬT CỦA TA!", "KẺ NGU NGỐC KHOE KHOANG SẼ BỊ THIÊU RỤI TRƯỚC!"],
            b4_p3: ["LỖI HỆ THỐNG! NGAY CẢ CÁI CHẬU NÀY CŨNG ĐANG CHẾ NHẠO TA SAO?!", "TA SẼ XÓA SẠCH MỌI DỮ LIỆU CỦA NGƯƠI LẪN CÁI CHẬU CODE NÀY!"]
        }
    },
    quyen: {
        default: [
            "...", "Sự tĩnh lặng là một món quà. Đừng phá vỡ nó.", "Ta chuộng bóng tối hơn những lời sáo rỗng.", 
            "Gieo hạt đi. Một mầm sống cô độc bắt đầu.", "Mỗi cuốn sách là một thế giới cô lập. Ta thích chìm vào đó.",
            "Từng chiếc lá rơi... tựa như dòng thời gian trôi tuột qua kẽ tay.", "Hãy để ta yên. Đám đông chỉ làm nhiễu loạn tâm trí.",
            "Nghệ thuật sinh ra từ sự dằn vặt và nỗi cô đơn sâu thẳm."
        ],
        bgs: {
            b1: [
                "Ban mai... quá nhiều ánh sáng. Nó làm ta nhức mắt.", "Tiếng ồn của buổi sáng phá hỏng thiết kế tĩnh lặng của ta.",
                "Ngày mới bắt đầu, kéo theo những lo toan trần tục. Ta không thích.", "Những tia nắng giả tạo xua tan bóng đen nghệ thuật của ta."
            ],
            b2: [
                "Rừng đêm... Nơi ta thuộc về.", "Bóng tối bao trùm. Mọi đường nét đều trở nên tinh tế.",
                "Yên bình làm sao. Chỉ có ta, cái cây, và sự tĩnh mịch của vũ trụ.", "Đây là lúc những bản thiết kế chân thật nhất thành hình."
            ],
            b3: [
                "Bạn của ta. Chúng ta thuộc về nhau.", "Con sói này hiểu sự tĩnh lặng tốt hơn bất kỳ con người nào.",
                "Chỉ những kẻ mang tâm hồn đầy vết xước mới có thể đứng cạnh nhau.", "Một cái bóng đơn độc đồng hành cùng một con thú hoang."
            ],
            b4: [
                "Ngọn lửa của sự tức giận chỉ thiêu rụi chính người mang nó.", "Ồn ào. Ta cần bóng tối.", 
                "Một kẻ thông minh nhưng không biết kiểm soát cảm xúc.", "Sự phẫn nộ phá vỡ mọi bố cục thẩm mỹ."
            ]
        },
        pots: {
            p1: [
                "Sự nguyên thủy. Ta thích nó.", "Không màu mè, chỉ là đất và mầm sống.", "Chậu đất nung thấm hút mồ hôi của tự nhiên.", 
                "Quay về với cát bụi. Đó là định mệnh của mọi sinh vật.", "Đơn giản là đỉnh cao của sự tinh tế. Màu của sự hoang tàn."
            ],
            p2: [
                "Sự lấp lánh giả tạo. Ta không ưa.", "Vàng không làm cái chết trở nên đẹp đẽ hơn.", "Quá chói lọi cho sự cô độc của ta.", 
                "Một chiếc lồng vàng cho một linh hồn tự do. Thật trớ trêu.", "Sự xa hoa vô nghĩa giữa vòng xoáy sinh tử."
            ],
            p3: [
                "Ánh sáng xanh điện tử... lạnh lẽo.", "Máy móc cũng biết cô đơn sao?", "Những dòng code chạy vô tận, như một vòng lặp không lối thoát.", 
                "Sự sống hữu cơ bị nhốt trong một nhà tù thuật toán.", "Ta nghe thấy tiếng bíp tĩnh lặng của linh kiện điện tử. Buồn bã lạ thường."
            ]
        },
        combos: {
            b1_p1: ["Ánh bình minh soi rõ những vết nứt trên chậu gốm. Nét đẹp của sự không hoàn hảo.", "Bắt đầu một vòng lặp nhạt nhẽo của tự nhiên."],
            b1_p2: ["Sự phô trương của vàng hòa cùng sự chói lóa của bình minh. Một bức tranh nhức mắt.", "Lóa mắt. Đưa ta về với bóng tối."],
            b1_p3: ["Màn hình điện tử mờ đi dưới nắng. Sự bất lực của nhân tạo trước tự nhiên.", "Code không thể chạy trốn khỏi thực tại sáng rõ."],
            b2_p1: ["Chậu đất hòa mình vào màn đêm. Sự vô danh tuyệt mỹ.", "Bóng tối ôm lấy mầm sống nguyên sơ. Ta thấy đồng cảm."],
            b2_p2: ["Giữa vực thẳm u tối, khối vàng vẫn cố chấp tỏa sáng. Nỗ lực trong vô vọng.", "Sự giàu có vô nghĩa giữa rừng sâu tĩnh mịch."],
            b2_p3: ["Giữa rừng u tối, ánh điện tử lập lòe như những linh hồn nhân tạo đi lạc.", "Một đoạn code nhấp nháy, cô độc như vì sao xa xăm."],
            b3_p1: ["Sói của ta gác bên chậu đất cằn cỗi. Một vẻ đẹp u sầu tuyệt mỹ.", "Thiên nhiên hoang dã. Không giả tạo, không tô vẽ."],
            b3_p2: ["Con thú hoang không màng đến giá trị của vàng. Khinh bỉ sự phù phiếm.", "Bạn ta thà ngắm trăng còn hơn nhìn khối kim loại vô tri này."],
            b3_p3: ["Tiếng máy móc làm xáo trộn bản năng của bầy sói.", "Con sói nhìn chằm chằm vào ánh sáng LED. Hai sự cô đơn khác biệt."],
            b4_p1: ["Đất nung không cháy, nhưng ngọn lửa điên rồ của hắn sẽ làm nó nứt vỡ.", "Hủy diệt. Đó là kết cục mà kẻ điên kia mang lại."],
            b4_p2: ["Vàng chảy ra, phơi bày sự biến dạng dưới ngọn lửa cuồng nộ.", "Sự xa hoa tan biến trong chớp mắt."],
            b4_p3: ["Mạch điện chập cháy. Ngay cả sự logic cũng sụp đổ trước cơn thịnh nộ.", "Một mớ hỗn độn ồn ào và vô nghĩa."]
        }
    },
    tuchill: {
        default: [
            "Cứ bình tĩnh thôi, việc gì phải vội?", "Một tách trà, một cuốn sách, thế là đủ cho một ngày chill.",
            "Cây cũng như mình thôi, thong thả thì mới bền.", "Hôm nay bạn thấy ổn chứ? Đừng quên mỉm cười một cái nhé.",
            "Thế giới ngoài kia ồn ào quá, vào đây nghe tiếng lá rơi với mình đi.", "Đừng áp lực quá, quan trọng là bạn đã bắt đầu mà, đúng không?",
            "Việc nay chưa xong thì mai làm, cây nay chưa lớn thì mai lớn. Chill đi.", "Bạn có đang hít thở sâu không đấy? Thả lỏng vai ra nào.",
            "Mọi chuyện rồi sẽ ổn thôi, giống như hạt mầm rồi sẽ nảy lộc ấy."
        ],
        bgs: {
            b1: [
                "Nắng sớm đẹp thật đấy, rất hợp để ngồi thiền.", "Chào buổi sáng! Cảm giác như cả thế giới đang thức dậy cùng mình.",
                "Vươn vai một cái đón gió sáng nào. Đời nhẹ tênh.", "Không khí trong vắt. Ly cà phê sáng ở đây thì tuyệt cú mèo."
            ],
            b2: [
                "Trăng đêm nay tròn ghê. Yên tĩnh thật sự.", "Bóng tối không đáng sợ đâu, nó giúp mình thấy rõ ánh sao hơn.",
                "Nghe tiếng dế kêu không? Khúc nhạc ru ngủ của thiên nhiên đấy.", "Đêm xuống rồi, gác lại âu lo và nghỉ ngơi thôi bạn."
            ],
            b3: [
                "Bé sói này trông ngầu đấy, nhưng mình thấy nó cũng chill phết.", "Sói cũng cần nghỉ ngơi, bạn cũng vậy. Cứ nằm ườn ra đi.",
                "Lông nó có vẻ mượt. Giá mà được vuốt một cái nhỉ.", "Người anh em Quyền nuôi pet cá tính đấy, nhưng nó ngồi im thì cũng hiền."
            ],
            b4: [
                "Wow, bác Quân có vẻ đang 'nóng' quá nhỉ? Thôi mình cứ kệ bác ấy, mình chill tiếp.", "Nóng giận hại gan lắm bác ơi. Uống trà tim sen cho hạ hỏa nào.",
                "Khí thế bừng bừng thế này không hợp với vibe của mình lắm.", "Căng căng, chỗ này đang hơi căng. Mình lui ra góc đọc sách nhé."
            ]
        },
        pots: {
            p1: [
                "Chậu đất mộc mạc thế này là mình thích nhất.", "Đơn giản là nhất, cậu thấy đúng không?",
                "Sờ vào vân đất thô ráp thấy bình yên lạ thường.", "Nước sơn xịn đến mấy cũng không qua được sự tự nhiên này."
            ],
            p2: [
                "Vàng bạc cũng chỉ là vật ngoài thân thôi, quan trọng là cái cây bên trong ấy.", "Chậu sáng quá, đeo kính râm vào chill cho đỡ chói mắt.",
                "Trồng cây trong chậu này áp lực phết nhỉ, sợ xước. Cứ thong thả thôi.", "Đẹp thì có đẹp, nhưng mình vẫn ưng sự giản dị hơn."
            ],
            p3: [
                "Công nghệ cũng hay, nhưng đừng quên dành thời gian cho thiên nhiên thực sự nhé.", "Bấm tạch tạch nghe cũng vui tai. Nhưng thà nghe tiếng chim hót còn hơn.",
                "Chậu thông minh thì mình đỡ phải nhớ lịch tưới nước. Quá hợp cho hệ người lười!", "Hiện đại hóa nông nghiệp à? Thú vị đấy."
            ]
        },
        combos: {
            b1_p1: ["Nắng sớm trên chậu đất... nhìn bình yên đến lạ.", "Khung cảnh hoàn hảo cho một buổi sáng thiền định."],
            b1_p2: ["Nắng hắt vào vàng lóa cả mắt. Mở nhạc lofi lên nghe cho át đi sự chói chang nào.", "Một buổi sáng rực rỡ và giàu có. Cũng được."],
            b1_p3: ["Vừa có nắng tự nhiên vừa có ánh sáng LED. Cái cây này sướng nhất rồi.", "Chill buổi sáng cùng đồ công nghệ. Vibe của thời đại mới."],
            b2_p1: ["Chậu đất lẫn vào màn đêm. Không bon chen, không ồn ào. Đúng ý mình.", "Yên bình quá. Thêm tách trà nóng nữa là đủ bộ."],
            b2_p2: ["Vàng rực lên trong đêm tối. Hơi nổi bật quá, nhưng thôi kệ.", "Ánh trăng phản chiếu lên thành chậu. Nhìn cũng nên thơ phết."],
            b2_p3: ["Ánh đèn LED giữa rừng đêm, trông như một buổi tiệc nhỏ vậy.", "Không cần đèn ngủ nữa, cái chậu này lo hết rồi."],
            b3_p1: ["Chậu đất, chó sói, rừng cây. Về với thiên nhiên hoang dã là đây.", "Sói cứ gác, mình cứ chill. Nước sông không phạm nước giếng."],
            b3_p2: ["Không biết sói có bị ánh vàng làm chói mắt không nhỉ?", "Sự sang chảnh bên cạnh sự hoang dã. Chênh lệch phết."],
            b3_p3: ["Sói có vẻ hợp với ánh đèn LED này đấy chứ.", "Công nghệ cao và động vật hoang dã. Cùng nhau chill thôi."],
            b4_p1: ["Bác Quân hét to làm rung cả chậu đất kìa. Thôi mình đi chỗ khác.", "Đất nung gặp lửa giận. Khô hạn quá, rót ly nước lọc uống cho mát."],
            b4_p2: ["Chậu vàng hấp thụ nhiệt kinh lắm. Đứng gần bỏng rát cả người. Chuồn lẹ!", "Sự tức giận làm lu mờ cả vẻ đẹp của vàng bạc."],
            b4_p3: ["Nóng quá coi chừng chập mạch nha bác Quân ơi. Chill đi!", "Bác ấy mắng cả cái chậu điện tử. Máy móc có tội tình gì đâu."]
        }
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
    },
    tuchill: {
        overwatered: "Ôi bạn ơi, bạn quan tâm quá đà rồi. Cái cây nó cần thở chứ không cần đi bơi... Thôi, coi như là một bài học thong thả nhé."
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
    'b4': { name: 'Sự Phẫn Nộ Của Quân', img: 'Img/Dr.Minh_Quan_Gian_Giu.jpg', type: 'bg' }, 
    'w1': { name: 'Bình Nước', img: 'Img/nuoc.png', type: 'tool' },
    'f1': { name: 'Phân Bón', img: 'Img/phanbon.png', type: 'tool' },
    'c1': { name: 'Dr.Minh Quân', img: 'Img/DrMinhQuan.png', type: 'character' },
    'c2': { name: 'Quyền Cô Độc', img: 'Img/MinhQuyen.png', type: 'character' },
    'c3': { name: 'TuChillGuy', img: 'Img/TuChillGuy.png', type: 'character' } 
};

// === HÀM RANDOM THOẠI TỔNG HỢP ===
function getCharacterQuote(charType, bgImg, potImg) {
    let bgKey = 'default';
    if (bgImg === 'Img/KhuVuonBanMai.jpg') bgKey = 'b1';
    else if (bgImg === 'Img/Rung_Dem_Huyen_Bi.png') bgKey = 'b2';
    else if (bgImg === 'Img/SoiCuaMinhQuyen.png') bgKey = 'b3';
    else if (bgImg === 'Img/Dr.Minh_Quan_Gian_Giu.jpg') bgKey = 'b4';

    let potKey = 'default';
    if (potImg.includes('NormalPot')) potKey = 'p1';
    else if (potImg.includes('GoldenPot')) potKey = 'p2';
    else if (potImg.includes('CoderPot')) potKey = 'p3';

    const charData = DIALOGUES[charType];
    let possibleQuotes = [];

    possibleQuotes.push(...charData.default);
    
    if (charData.bgs && charData.bgs[bgKey]) {
        possibleQuotes.push(...charData.bgs[bgKey]);
    }
    
    if (charData.pots && charData.pots[potKey]) {
        possibleQuotes.push(...charData.pots[potKey]);
        possibleQuotes.push(...charData.pots[potKey]);
    }

    const comboKey = `${bgKey}_${potKey}`;
    if (charData.combos && charData.combos[comboKey]) {
        for(let i=0; i<5; i++) possibleQuotes.push(...charData.combos[comboKey]);
    }

    return possibleQuotes[Math.floor(Math.random() * possibleQuotes.length)];
}

function getCurrentCharType() {
    if (userData.equippedChar === 'c1') return 'quan';
    if (userData.equippedChar === 'c2') return 'quyen';
    if (userData.equippedChar === 'c3') return 'tuchill';
    return 'thanh';
}

function triggerDramaticDeath(cause) {
    const charType = getCurrentCharType();
    const message = DRAMATIC_DEATH_MESSAGES[charType][cause];
    const deathOverlay = document.getElementById('dramatic-death-overlay');
    const deathMessageText = document.getElementById('death-message-text');

    if (deathMessageText) deathMessageText.textContent = message;
    if (deathOverlay) deathOverlay.classList.add('show');
    
    setTimeout(() => {
        if (deathOverlay) deathOverlay.classList.remove('show');
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
    else if (charType === 'tuchill') charImg.src = 'Img/TuChillGuy.png';
    else charImg.src = 'Img/crazy_thanh.png';

    charImg.onclick = () => {
        if (userData.plantState === 'dead') {
            let deadMsg = charType === 'quan' ? "Thí nghiệm thất bại. Một cái xác khô." : 
                          (charType === 'quyen' ? "Cái chết là sự giải thoát trong im lặng." : 
                          (charType === 'tuchill' ? "Nó ngủ hơi sâu rồi... bạn trồng lại cây mới nhé." : "Cây đã chết úng mất rồi wabo..."));
            updateThanhSpeech(deadMsg, "error");
        } else if (userData.plantedSeed) {
            const currentBg = userData.equippedBg || 'Img/AnhBackGroundGarden.png';
            const currentPot = userData.equippedPot || 'Img/BrokenPot.png';
            const randomQuote = getCharacterQuote(charType, currentBg, currentPot);
            updateThanhSpeech(randomQuote, "success");
        } else {
            let emptyMsg = charType === 'quan' ? "Thùng rỗng kêu to, chậu không gieo hạt. Gieo đi!" : 
                          (charType === 'quyen' ? "Khoảng trống. Đợi một hạt giống được gieo xuống." : 
                          (charType === 'tuchill' ? "Chậu đang trống kìa, bạn gieo một hạt giống đi cho vui nhà vui cửa." : "Cậu chọn hạt giống đi nào"));
            updateThanhSpeech(emptyMsg, "warning");
        }
    };
}

// === LOGIC VIDEO BACKGROUND KẾT HỢP JUMPSCARE MINH QUÂN ===
let bgVideoInterval = null;

function handleBackgroundVideo() {
    const videoEl = document.getElementById('wolf-bg-video');
    if (!videoEl) return;

    if (bgVideoInterval) {
        clearInterval(bgVideoInterval);
        bgVideoInterval = null;
    }

    // Nền Quyền: Sói hú (Tỉ lệ 50%, mỗi 15s)
    if (userData.equippedBg === 'Img/SoiCuaMinhQuyen.png') {
        if(videoEl.src.indexOf('VideoSoiCoDoc.mp4') === -1) videoEl.src = 'Video/VideoSoiCoDoc.mp4';
        bgVideoInterval = setInterval(() => {
            if (Math.random() >= 0.5) playBgVideo(videoEl, false, 'wolf');
        }, 15000);
    } 
    // Nền Quân: Giận dữ (Tỉ lệ 50%, mỗi 30s)
    else if (userData.equippedBg === 'Img/Dr.Minh_Quan_Gian_Giu.jpg') {
        if(videoEl.src.indexOf('Dr.Minh_Quan_Gian_Giu.mp4') === -1) videoEl.src = 'Video/Dr.Minh_Quan_Gian_Giu.mp4';
        bgVideoInterval = setInterval(() => {
            if (Math.random() >= 0.5) playBgVideo(videoEl, false, 'quan');
        }, 30000); // 30s 1 lần
    } else {
        videoEl.pause();
        videoEl.classList.remove('playing');
        videoEl.onended = null;
    }
}

function playBgVideo(videoEl, force = false, type = 'wolf') {
    if (!videoEl.paused && !force) return; 
    videoEl.currentTime = 0;
    
    const mainBg = document.getElementById('main-bg');

    videoEl.play().then(() => {
        videoEl.classList.add('playing');
        
        // NẾU LÀ MINH QUÂN: Ẩn sạch mọi thứ trên màn hình để video làm trung tâm (Jumpscare 3s)
        if (type === 'quan' && mainBg) {
            videoEl.style.zIndex = '99999';
            Array.from(mainBg.children).forEach(child => {
                if (child.id !== 'wolf-bg-video') {
                    child.dataset.oldOpacity = child.style.opacity || '';
                    child.style.opacity = '0';
                    child.style.pointerEvents = 'none';
                }
            });
        }
    }).catch(e => console.log("Không thể tự động phát video:", e));

    videoEl.onended = () => {
        videoEl.classList.remove('playing');
        
        // Phục hồi lại toàn bộ UI
        if (type === 'quan' && mainBg) {
            videoEl.style.zIndex = '1';
            Array.from(mainBg.children).forEach(child => {
                if (child.id !== 'wolf-bg-video') {
                    child.style.opacity = child.dataset.oldOpacity || '';
                    child.style.pointerEvents = '';
                }
            });
        }
        videoEl.onended = null;
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
                         (charType === 'quyen' ? "Tàn lụi rồi... Vòng lặp của tự nhiên." : 
                         (charType === 'tuchill' ? "Nó ngủ sâu quá rồi, bạn nhổ lên trồng cây mới cho vui nhé." : "Waaaa! Cây chết úng rồi cậu nhổ lên trồng lại đi!"));
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

                    let updatePayload = {
                        plantState: 'dead', inventory: userData.inventory
                    };

                    // KIỂM TRA ĐIỀU KIỆN MỞ KHOÁ MQGD
                    if (charType === 'quan' && !userData.MQGD) {
                        userData.MQGD = true;
                        updatePayload.MQGD = true;
                    }

                    triggerDramaticDeath('overwatered');

                    updateGardenVisuals();
                    renderInventoryUI();
                    
                    let msg = charType === 'quan' ? "Cây đã thối rữa vì ngươi tưới quá tay! Nhổ bỏ đi!" : 
                             (charType === 'quyen' ? "Sự sống đã chìm nghỉm trong sai lầm của ngươi." : 
                             (charType === 'tuchill' ? "Thôi xong, cây bơi ngửa luôn rồi... nhổ đi trồng lại thôi." : "Wabo... Cây đã chết úng vì tưới quá tay rồi!"));
                    updateThanhSpeech(msg, "error");
                    
                    updateDoc(doc(db, "users", currentUser.uid), updatePayload).catch(e => console.error(e));

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
                         (charType === 'quyen' ? "Nó đang chới với trong nước... giống như một kẻ lạc lõng." : 
                         (charType === 'tuchill' ? "Úi úi, ngập rồi bạn ơi! Dừng tưới nha, cây nó nghẹt thở mất." : "Waby wabo! Dừng lại! Cây sắp bơi trong chậu luôn rồi kìa!"));
                updateThanhSpeech(msg, "error");

                updateDoc(doc(db, "users", currentUser.uid), {
                    inventory: userData.inventory, lastWatered: now, lastWaterDateStr: todayStr,
                    waterCountToday: userData.waterCountToday, plantState: 'overwatered', overwateredTime: now
                }).catch(e => console.error(e));

            } else {
                updateGardenVisuals();
                renderInventoryUI();
                
                let waterMsg = charType === 'quan' ? "Ngươi tưới nước được rồi đấy. Tiếp tục phát huy đi." : 
                               (charType === 'quyen' ? "Tưới nước đi... đừng để sự tĩnh lặng này biến thành cái chết." : 
                               (charType === 'tuchill' ? "Cây được uống nước mát rồi kìa, nhìn tươi hẳn ra." : "Waby wabo! Cảm ơn cậu đã tưới nước, cây trông tươi tắn lắm!"));
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
                         (charType === 'quyen' ? "Tàn tro không thể sống lại bằng phân bón." : 
                         (charType === 'tuchill' ? "Nó ngủ ngoan rồi, phân bón giờ không kịp nữa đâu bạn." : "Waaaa... Cây chết rồi bón phân cũng vô ích thôi."));
                updateThanhSpeech(msg, "error");
                return;
            }

            const todayStr = new Date().toLocaleDateString('vi-VN');
            if (userData.lastFertilizerDateStr === todayStr) {
                let warnMsg = charType === 'quan' ? "Bộ não ngươi bị chậm à? Bón phân 1 ngày 1 lần thôi!" : 
                               (charType === 'quyen' ? "Hấp tấp không mang lại kết quả. Hôm nay đủ rồi." : 
                               (charType === 'tuchill' ? "Nay nó ăn no rồi, cứ thong thả mai bón tiếp nhé." : "Hôm nay cậu đã bón phân rồi mỗi ngày chỉ 1 lần thôi nhé"));
                updateThanhSpeech(warnMsg, "warning");
                return;
            }

            if (userData.fertilizerTime) {
                let msg = charType === 'quan' ? "Ngươi không biết cơ chế hấp thụ à? Nó đang quá tải dinh dưỡng rồi đấy!" : 
                         (charType === 'quyen' ? "Cây đang hấp thụ. Đừng làm phiền quá trình của nó." : 
                         (charType === 'tuchill' ? "Từ từ thôi, để cây nó tiêu hóa phân bón cũ đã nào." : "Burb! Cây đang tiêu hóa phân bón đợt trước, đợi chút nhé!"));
                updateThanhSpeech(msg, "warning");
                return;
            }
            userData.phanbon -= 1;
            userData.fertilizerTime = Date.now();
            userData.lastFertilizerDateStr = todayStr;

            updateGardenVisuals();
            renderInventoryUI();
            
            let fertMsg = charType === 'quan' ? "Đã bón phân. Hãy xem công trình quang hợp vĩ đang diễn ra đi!" : 
                         (charType === 'quyen' ? "Dinh dưỡng hòa vào đất. Sự phát triển diễn ra trong im lặng." : 
                         (charType === 'tuchill' ? "Ăn no chóng lớn nhé cây ơi, mình chill chờ cây nở hoa." : "Đã bón phân! Sao cây không lớn nhỉ?. Ogga bogga!"));
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
                             (charType === 'quyen' ? "Chăm sóc nó đi. Đừng để ta phải lên tiếng." : 
                             (charType === 'tuchill' ? "Này, ngó qua cái chậu xíu nha, cây nó réo kìa." : "Hãy thử bấm vào chậu đi Wabo!"));
                        lastReminderWasCare = false;
                    } else {
                        if (needsWater && needsFertilizer) {
                            msg = charType === 'quan' ? "Ngươi định giết cái cây này bằng sự thiếu hụt cả nước lẫn phân bón sao?" : 
                                 (charType === 'quyen' ? "Sự sống đang kiệt quệ dần. Nó cần nước và dinh dưỡng." : 
                                 (charType === 'tuchill' ? "Cây đói với khát lả rồi, bạn chăm nó tí đi." : "Raawr! Cây khát nước và đói phân bón kìa!"));
                        } else if (needsWater) {
                            msg = charType === 'quan' ? "Cây đang thiếu H2O. Tưới nó ngay!" : 
                                 (charType === 'quyen' ? "Đất đang khô cằn. Cho nó một chút sự sống đi." : 
                                 (charType === 'tuchill' ? "Hình như cây đang khát, bạn cho nó xin tí nước cho mát nhé?" : "Cây đang cần nước đấy cậu tưới cho nó đi!"));
                        } else if (needsFertilizer) {
                            msg = charType === 'quan' ? "Kém cỏi. Vào Thư Viện đọc sách kiếm phân bón ngay!" : 
                                 (charType === 'quyen' ? "Tới Thư Viện mang phân bón về. Cây cần nuôi dưỡng." : 
                                 (charType === 'tuchill' ? "Rảnh thì dạo Thư Viện tí kiếm phân bón cho cây lớn nha." : "Cậu vào Thư Viện kiếm phân bón cho cây mau lớn nhé!"));
                        }
                        lastReminderWasCare = true;
                    }
                } else {
                    const currentBg = userData.equippedBg || 'Img/AnhBackGroundGarden.png';
                    const currentPot = userData.equippedPot || 'Img/BrokenPot.png';
                    msg = getCharacterQuote(charType, currentBg, currentPot);
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

    handleBackgroundVideo();

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
                          (charType === 'quyen' ? "Cái chết là sự giải thoát trong im lặng." : 
                          (charType === 'tuchill' ? "Nó ngủ hơi sâu rồi... bạn trồng lại cây mới nhé." : "Cây đã chết úng mất rồi wabo..."));
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
                              (charType === 'quyen' ? "Đừng nhấn chìm nó thêm nữa." : 
                              (charType === 'tuchill' ? "Ngập nước rồi kìa bạn ơi, dừng tay lại chút." : "Wabo! Cây sắp bơi trong chậu rồi dừng tưới đi!"));
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
                              (charType === 'quyen' ? "Cây đang khát. Cứu nó trước khi quá muộn." : 
                              (charType === 'tuchill' ? "Khô rang rồi kìa, cứu bé nó một ly nước đi bạn." : "Cây đang héo kìa cậu tưới nước đi"));
            } else {
                if (progress >= 100) {
                    currentLabel = charType === 'quan' ? "Cũng được đấy. Thu hoạch nhanh đi." : 
                                  (charType === 'quyen' ? "Đến lúc chia tay. Thu hoạch đi." : 
                                  (charType === 'tuchill' ? "Hoa nở đẹp quá, thu hoạch tận hưởng thành quả thôi." : "Hoa nở rồi cậu thu hoạch đi"));
                } else {
                    currentLabel = charType === 'quan' ? "Ta đang giám sát ngươi chăm cây đấy." : 
                                  (charType === 'quyen' ? "Ta vẫn đứng đây, lặng lẽ chờ hoa nở." : 
                                  (charType === 'tuchill' ? "Thong thả chăm cây, nhẹ nhàng ngắm hoa nhé." : "Waby wabo! Nhớ chăm sóc cây mỗi ngày nhé!"));
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
                      (charType === 'quyen' ? "Khoảng trống. Đợi một hạt giống được gieo xuống." : 
                      (charType === 'tuchill' ? "Chậu đang trống kìa, bạn gieo một hạt giống đi cho vui nhà vui cửa." : "Cậu chọn hạt giống đi nào"));
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
    
    // GỌI VIDEO NGAY KHI BẤM NÚT "GIA TRƯỞNG" NẾU CÓ TRANG BỊ
    if (userData.equippedBg === 'Img/SoiCuaMinhQuyen.png') {
        const videoEl = document.getElementById('wolf-bg-video');
        if (videoEl) playBgVideo(videoEl, true, 'wolf');
    } else if (userData.equippedBg === 'Img/Dr.Minh_Quan_Gian_Giu.jpg') {
        const videoEl = document.getElementById('wolf-bg-video');
        if (videoEl) playBgVideo(videoEl, true, 'quan');
    }
    
    let cheatMsg = charType === 'quan' ? "Thao túng thời gian sao? Thú vị đấy, chăm sóc tiếp đi." : 
                  (charType === 'quyen' ? "Bước nhảy vọt phi lý. Nhưng hoa vẫn sẽ nở." : 
                  (charType === 'tuchill' ? "Wow, phép thuật à? Lớn nhanh quá." : "Tớ vừa dùng cỗ máy thời gian bằng chảo! Cây lại đói rồi!"));
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
                                    (charType === 'quyen' ? "Một thành quả nhỏ bé giữa thế giới rộng lớn. Cất nó đi." : 
                                    (charType === 'tuchill' ? "Thu hoạch thôi! Việc tốt luôn bắt đầu từ những đóa hoa nhỏ." : "Raaww! Thu hoạch thành công, cám ơn cậu nha!"));
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
    if (userData.inventory['c3'] > 0 || userData.equippedChar === 'c3') {
        let isCharEquipped = userData.equippedChar === 'c3';
        htmlPots += `
            <div class="inv-item-card">
                <img src="${ITEM_DB['c3'].img}" class="inv-item-img">
                <div class="inv-item-name">${ITEM_DB['c3'].name}</div>
                <div class="inv-item-qty">Sở hữu</div>
                <button class="btn-use ${isCharEquipped ? 'btn-unequip' : ''}" onclick="useItem('c3', 'character', '${isCharEquipped ? 'unequip' : 'c3'}')">
                    ${isCharEquipped ? 'GỠ BỎ' : 'TRANG BỊ'}
                </button>
            </div>
        `;
    }

    for (const [id, count] of Object.entries(userData.inventory)) {
        if (!ITEM_DB[id] || !count || id === 'w1' || id === 'f1' || id === 'c1' || id === 'c2' || id === 'c3') continue;
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
                        (charType === 'quyen' ? "Một mầm sống cô độc bắt đầu từ đây." : 
                        (charType === 'tuchill' ? "Gieo hạt rồi, giờ chỉ cần thong thả chờ đợi thôi." : "Waaaby wabo! Đã gieo hạt nhớ tưới nước thường xuyên nhé"));
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