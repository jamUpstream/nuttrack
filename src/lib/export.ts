import {
  documentDirectory,
  getContentUriAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { Platform, Share } from 'react-native';

import { exportCsv } from '../db';

export async function shareCsvExport() {
  if (!documentDirectory) {
    throw new Error('File export is not available on this device.');
  }

  const csv = await exportCsv();
  const stamp = new Date().toISOString().slice(0, 10);
  const fileUri = `${documentDirectory}nuttrack-export-${stamp}.csv`;

  await writeAsStringAsync(fileUri, csv);

  const shareUrl =
    Platform.OS === 'android'
      ? await getContentUriAsync(fileUri)
      : fileUri;

  return Share.share({
    title: 'nuttrack-export.csv',
    message: Platform.OS === 'ios' ? 'NutTrack CSV export' : undefined,
    url: shareUrl,
  });
}
