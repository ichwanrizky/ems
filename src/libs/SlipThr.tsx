import {
  Document,
  Page,
  View,
  Image,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "OpenSans",
  fonts: [
    { src: "/fonts/OpenSans-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/OpenSans-SemiBold.ttf", fontWeight: "semibold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    fontFamily: "OpenSans",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingBottom: 10,
    marginBottom: 20,
  },
  logoTitleContainer: {
    marginLeft: 125,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexGrow: 1,
  },
  logo: { width: 100, height: "auto" },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  certificatesContainer: { display: "flex", flexDirection: "row" },
  certificates: { width: 60, height: "auto", marginLeft: 10 },
  detailRow: {
    fontSize: 12,
    display: "flex",
    flexDirection: "row",
    marginBottom: 5,
  },
  detailTitle: { width: 100, fontWeight: "bold" },
  detailContent: { flex: 1 },
  detailsSection: { marginBottom: 5 },
  horizontalLine: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  details: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailColumn: { width: "48%" },
  columnTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  noBorderTableRow: {
    fontSize: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  noBorderTableRow2: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 11,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  noBorderTableRow3: {
    fontSize: 11,
    fontWeight: "bold",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  noBorderTableCol: { width: "110%", textAlign: "left" },
  noBorderTableColWide: { width: "45%", textAlign: "right" },
});

type SlipThrData = {
  id: number;
  bulan: number;
  tahun: number;
  thr: number;
  pph21: number;
  net_thr: number;
  pegawai: { nama: string; position: string };
  department: { nama_department: string };
};

const monthNames = (month: number) => {
  const names = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return names[month - 1];
};

const SlipThrPdf = ({ data }: { data: SlipThrData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoTitleContainer}>
          <Image src="/img/panji.png" style={styles.logo} />
          <Text style={styles.title}>PT. PANJI JAYA</Text>
        </View>
        <View style={styles.certificatesContainer}>
          <Image src="/img/iso_9001.jpg" style={styles.certificates} />
          <Image src="/img/iso_14001.jpg" style={styles.certificates} />
        </View>
      </View>

      {/* Info Karyawan */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailTitle}>Name</Text>
          <Text style={styles.detailContent}>: {data.pegawai.nama?.toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailTitle}>Position</Text>
          <Text style={styles.detailContent}>: {data.pegawai.position?.toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailTitle}>Section</Text>
          <Text style={styles.detailContent}>: {data.department.nama_department?.toUpperCase()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailTitle}>Month</Text>
          <Text style={styles.detailContent}>: {monthNames(data.bulan)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailTitle}>Year</Text>
          <Text style={styles.detailContent}>: {data.tahun}</Text>
        </View>
      </View>

      {/* Two-column layout sama seperti slip gaji */}
      <View style={styles.details}>
        {/* Kolom kiri: THR */}
        <View style={styles.detailColumn}>
          <Text style={styles.columnTitle}>THR</Text>
          <View style={styles.noBorderTableRow}>
            <Text style={styles.noBorderTableCol}>THR (Gross)</Text>
            <Text>:</Text>
            <Text style={styles.noBorderTableColWide}>
              {data.thr.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.noBorderTableRow2}>
            <Text style={styles.noBorderTableCol}>TOTAL THR</Text>
            <Text>:</Text>
            <Text style={styles.noBorderTableColWide}>
              {data.thr.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        {/* Kolom kanan: DEDUCTION */}
        <View style={styles.detailColumn}>
          <Text style={styles.columnTitle}>DEDUCTION</Text>
          <View style={styles.noBorderTableRow}>
            <Text style={styles.noBorderTableCol}>PPH21</Text>
            <Text>:</Text>
            <Text style={styles.noBorderTableColWide}>
              {data.pph21.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.noBorderTableRow2}>
            <Text style={styles.noBorderTableCol}>DEDUCTION (B)</Text>
            <Text>:</Text>
            <Text style={styles.noBorderTableColWide}>
              {data.pph21.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.noBorderTableRow3}>
            <Text style={styles.noBorderTableCol}>NET THR (A-B)</Text>
            <Text>:</Text>
            <Text style={styles.noBorderTableColWide}>
              {data.net_thr.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default SlipThrPdf;
