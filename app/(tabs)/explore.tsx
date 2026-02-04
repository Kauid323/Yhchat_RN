import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import {
    Divider,
    List,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';

export default function TabTwoScreen() {
  const theme = useTheme();

  const CustomCollapsible = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [expanded, setExpanded] = React.useState(false);

    return (
      <List.Accordion
        title={title}
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        left={props => <List.Icon {...props} icon={expanded ? "chevron-down" : "chevron-right"} />}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <View style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 16 }}>
          {children}
        </View>
      </List.Accordion>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <Surface style={styles.titleContainer} elevation={0}>
        <Text
          variant="headlineMedium"
          style={{
            fontFamily: Fonts.rounded,
            fontWeight: 'bold',
          }}>
          云湖聊天功能
        </Text>
      </Surface>
      
      <Text variant="bodyLarge" style={styles.description}>
        本应用集成了云湖平台的核心功能
      </Text>

      <Surface style={styles.accordionContainer} elevation={1}>
        <CustomCollapsible title="用户认证">
          <Text variant="bodyMedium">支持邮箱登录和设备认证，安全可靠。</Text>
          <Text variant="bodyMedium">用户信息管理，包括昵称和头像修改。</Text>
        </CustomCollapsible>
        
        <Divider />
        
        <CustomCollapsible title="消息功能">
          <Text variant="bodyMedium">支持文本消息发送和接收</Text>
          <Text variant="bodyMedium">消息历史记录查询</Text>
          <Text variant="bodyMedium">消息撤回和编辑功能</Text>
        </CustomCollapsible>

        <Divider />

        <CustomCollapsible title="群组管理">
          <Text variant="bodyMedium">群组信息查看</Text>
          <Text variant="bodyMedium">群组成员管理</Text>
          <Text variant="bodyMedium">群组禁言和踢人功能</Text>
        </CustomCollapsible>

        <Divider />

        <CustomCollapsible title="API集成">
          <Text variant="bodyMedium">本应用使用了云湖平台的官方API:</Text>
          <Text variant="bodyMedium">• 用户API (user): 登录、用户信息管理</Text>
          <Text variant="bodyMedium">• 消息API (msg): 消息发送、接收、管理</Text>
          <Text variant="bodyMedium">• 群组API (group): 群组管理功能</Text>
          <ExternalLink href="https://chat-go.jwzhd.com/docs">
            <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: 8 }}>查看API文档</Text>
          </ExternalLink>
        </CustomCollapsible>
      </Surface>

      <Surface style={styles.infoCard} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>更多信息</Text>
        <Text variant="bodyMedium" style={styles.cardText}>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>w</Text> in the terminal.
        </Text>
        
        <Divider style={styles.cardDivider} />
        
        <Text variant="bodyMedium" style={styles.cardText}>
          For static images, use the @2x and @3x suffixes.
        </Text>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center', marginTop: 16 }}
        />
      </Surface>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
  },
  accordionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    opacity: 0.8,
    lineHeight: 20,
  },
  cardDivider: {
    marginVertical: 12,
  },
});